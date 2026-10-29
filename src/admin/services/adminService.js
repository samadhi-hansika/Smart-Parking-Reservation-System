/**
 * ParkLink Admin Module - Firestore Service Layer
 * Encapsulates all Firestore queries, transactions, and mutations for admin functionality.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

/* =========================================================
   1. LOCATIONS MANAGEMENT
========================================================= */

/**
 * Fetch all locations once
 */
export async function getLocations() {
  const colRef = collection(db, "locations");
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    // Standardize pricePerHour and price
    pricePerHour: Number(d.data().pricePerHour ?? d.data().price ?? 0),
    totalSlots: Number(d.data().totalSlots ?? 0),
  }));
}

/**
 * Real-time subscription to locations
 */
export function subscribeLocations(onSuccess, onError) {
  const colRef = collection(db, "locations");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const locations = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        pricePerHour: Number(d.data().pricePerHour ?? d.data().price ?? 0),
        totalSlots: Number(d.data().totalSlots ?? 0),
      }));
      onSuccess(locations);
    },
    (err) => {
      console.error("Error subscribing to locations:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Get a single location by ID
 */
export async function getLocationById(locationId) {
  const docRef = doc(db, "locations", locationId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    pricePerHour: Number(data.pricePerHour ?? data.price ?? 0),
    totalSlots: Number(data.totalSlots ?? 0),
  };
}

/**
 * Add a new location
 */
export async function createLocation(locationData) {
  const colRef = collection(db, "locations");
  const cleanData = {
    name: locationData.name.trim(),
    address: locationData.address.trim(),
    city: locationData.city.trim(),
    totalSlots: Number(locationData.totalSlots),
    pricePerHour: Number(locationData.pricePerHour),
    price: Number(locationData.pricePerHour), // backward compatibility for member 2
    status: locationData.status || "active",
    description: (locationData.description || "").trim(),
    features: locationData.features || ["24/7 Access", "CCTV", "Security"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await addDoc(colRef, cleanData);
  return { id: docRef.id, ...cleanData };
}

/**
 * Update an existing location
 */
export async function updateLocation(locationId, locationData) {
  const docRef = doc(db, "locations", locationId);
  const cleanData = {
    ...locationData,
    pricePerHour: Number(locationData.pricePerHour ?? locationData.price ?? 0),
    price: Number(locationData.pricePerHour ?? locationData.price ?? 0),
    totalSlots: Number(locationData.totalSlots ?? 0),
    updatedAt: new Date().toISOString(),
  };
  // remove id if accidentally passed in body
  delete cleanData.id;
  await updateDoc(docRef, cleanData);
  return { id: locationId, ...cleanData };
}

/**
 * Delete a location and verify if it can be safely removed
 */
export async function deleteLocation(locationId) {
  // Check if any active reservations exist at this location
  const q = query(
    collection(db, "reservations"),
    where("locationId", "==", locationId),
    where("status", "in", ["confirmed", "active", "pending"])
  );
  const resSnap = await getDocs(q);
  if (!resSnap.empty) {
    throw new Error(
      `Cannot delete location: It has ${resSnap.size} active or confirmed reservation(s). Please resolve or cancel them first.`
    );
  }

  // Delete all slots belonging to this location
  const slotsQ = query(collection(db, "slots"), where("locationId", "==", locationId));
  const slotsSnap = await getDocs(slotsQ);
  if (!slotsSnap.empty) {
    const batch = writeBatch(db);
    slotsSnap.docs.forEach((slotDoc) => batch.delete(slotDoc.ref));
    await batch.commit();
  }

  // Delete location document
  await deleteDoc(doc(db, "locations", locationId));
  return true;
}

/* =========================================================
   2. SLOTS MANAGEMENT
========================================================= */

/**
 * Fetch slots, optionally filtered by locationId
 */
export async function getSlots(locationId = null) {
  let q = collection(db, "slots");
  if (locationId) {
    q = query(q, where("locationId", "==", locationId));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    price: Number(d.data().price ?? 0),
  }));
}

/**
 * Real-time subscription to slots
 */
export function subscribeSlots(locationId = null, onSuccess, onError) {
  let q = collection(db, "slots");
  if (locationId) {
    q = query(q, where("locationId", "==", locationId));
  }
  return onSnapshot(
    q,
    (snapshot) => {
      const slots = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        price: Number(d.data().price ?? 0),
      }));
      onSuccess(slots);
    },
    (err) => {
      console.error("Error subscribing to slots:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Create a single slot
 */
export async function createSlot(slotData) {
  const colRef = collection(db, "slots");
  const cleanData = {
    locationId: slotData.locationId,
    locationName: slotData.locationName || "",
    slotNumber: slotData.slotNumber.trim().toUpperCase(),
    type: slotData.type || "car",
    status: slotData.status || "available",
    price: Number(slotData.price || 0),
    floor: slotData.floor || "Level 1",
    lane: slotData.lane || slotData.slotNumber.charAt(0) || "A",
    createdAt: new Date().toISOString(),
  };

  // Check duplicate slotNumber in same location
  const dupQ = query(
    colRef,
    where("locationId", "==", slotData.locationId),
    where("slotNumber", "==", cleanData.slotNumber)
  );
  const dupSnap = await getDocs(dupQ);
  if (!dupSnap.empty) {
    throw new Error(`Slot number "${cleanData.slotNumber}" already exists in this location.`);
  }

  const docRef = await addDoc(colRef, cleanData);
  return { id: docRef.id, ...cleanData };
}

/**
 * Update a slot
 */
export async function updateSlot(slotId, slotData) {
  const docRef = doc(db, "slots", slotId);
  const cleanData = {
    ...slotData,
    slotNumber: slotData.slotNumber ? slotData.slotNumber.trim().toUpperCase() : undefined,
    price: slotData.price !== undefined ? Number(slotData.price) : undefined,
    updatedAt: new Date().toISOString(),
  };
  delete cleanData.id;
  await updateDoc(docRef, cleanData);
  return { id: slotId, ...cleanData };
}

/**
 * Check if a slot currently has active reservations
 */
export async function checkSlotHasActiveReservations(slotId) {
  const q = query(
    collection(db, "reservations"),
    where("slotId", "==", slotId),
    where("status", "in", ["confirmed", "active", "pending"])
  );
  const snap = await getDocs(q);
  return {
    hasActive: !snap.empty,
    count: snap.size,
    reservations: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}

/**
 * Delete a slot with active reservation protection
 */
export async function deleteSlot(slotId, slotNumber = "") {
  const activeCheck = await checkSlotHasActiveReservations(slotId);
  if (activeCheck.hasActive) {
    const activeRes = activeCheck.reservations[0];
    throw new Error(
      `Cannot delete slot ${slotNumber || slotId}: It has an active reservation (#${activeRes.id.slice(
        0,
        6
      )}) for date ${activeRes.date || "today"}. Complete or cancel the reservation first.`
    );
  }

  await deleteDoc(doc(db, "slots", slotId));
  return true;
}

/**
 * Bulk create slots for a location
 */
export async function bulkCreateSlots({
  locationId,
  locationName = "",
  prefix = "A",
  startNumber = 1,
  count = 10,
  type = "car",
  price = 150,
  floor = "Level 1",
}) {
  const cleanPrefix = prefix.trim().toUpperCase();
  const start = Number(startNumber);
  const total = Number(count);
  const rate = Number(price);

  // Check existing slot numbers in this location to avoid duplication
  const existingSlots = await getSlots(locationId);
  const existingNumbers = new Set(existingSlots.map((s) => s.slotNumber));

  const batch = writeBatch(db);
  const slotsCol = collection(db, "slots");
  const createdSlots = [];
  const skippedSlots = [];

  for (let i = 0; i < total; i++) {
    const num = start + i;
    const slotNumber = `${cleanPrefix}-${String(num).padStart(2, "0")}`;

    if (existingNumbers.has(slotNumber)) {
      skippedSlots.push(slotNumber);
      continue;
    }

    const newDocRef = doc(slotsCol);
    const slotData = {
      locationId,
      locationName,
      slotNumber,
      lane: cleanPrefix,
      floor,
      type,
      status: "available",
      price: rate,
      createdAt: new Date().toISOString(),
    };

    batch.set(newDocRef, slotData);
    createdSlots.push({ id: newDocRef.id, ...slotData });
  }

  if (createdSlots.length > 0) {
    await batch.commit();
  }

  return {
    createdCount: createdSlots.length,
    skippedCount: skippedSlots.length,
    createdSlots,
    skippedSlots,
  };
}

/* =========================================================
   3. RESERVATIONS MANAGEMENT
========================================================= */

/**
 * Fetch all reservations once
 */
export async function getReservations() {
  const colRef = collection(db, "reservations");
  const snap = await getDocs(colRef);
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    amount: Number(d.data().amount ?? d.data().totalAmount ?? 0),
    totalAmount: Number(d.data().totalAmount ?? d.data().amount ?? 0),
  }));
  // Sort descending by date and startTime
  list.sort((a, b) => `${b.date || ""}${b.startTime || ""}`.localeCompare(`${a.date || ""}${a.startTime || ""}`));
  return list;
}

/**
 * Real-time subscription to all reservations
 */
export function subscribeReservations(onSuccess, onError) {
  const colRef = collection(db, "reservations");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        amount: Number(d.data().amount ?? d.data().totalAmount ?? 0),
        totalAmount: Number(d.data().totalAmount ?? d.data().amount ?? 0),
      }));
      list.sort((a, b) =>
        `${b.date || ""}${b.startTime || ""}`.localeCompare(`${a.date || ""}${a.startTime || ""}`)
      );
      onSuccess(list);
    },
    (err) => {
      console.error("Error subscribing to reservations:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Update reservation status (approve, complete, cancel)
 * Automatically updates associated slot status (e.g. releases slot to available)
 */
export async function updateReservationStatus(reservationId, newStatus) {
  const reservationRef = doc(db, "reservations", reservationId);

  await runTransaction(db, async (transaction) => {
    const resSnap = await transaction.get(reservationRef);
    if (!resSnap.exists()) {
      throw new Error(`Reservation ${reservationId} not found.`);
    }

    const resData = resSnap.data();
    const slotId = resData.slotId;

    // Update reservation document
    transaction.update(reservationRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === "completed" ? { completedAt: new Date().toISOString() } : {}),
      ...(newStatus === "cancelled" ? { cancelledAt: new Date().toISOString() } : {}),
    });

    // If reservation has a valid slot reference, update slot status appropriately
    if (slotId) {
      const slotRef = doc(db, "slots", slotId);
      const slotSnap = await transaction.get(slotRef);

      if (slotSnap.exists()) {
        if (newStatus === "cancelled" || newStatus === "completed") {
          // Release the slot back to available
          transaction.update(slotRef, {
            status: "available",
            reservedBy: null,
            reservationId: null,
            updatedAt: new Date().toISOString(),
          });
        } else if (newStatus === "confirmed" || newStatus === "active") {
          // Lock slot as reserved
          transaction.update(slotRef, {
            status: "reserved",
            reservationId,
            reservedBy: resData.userId || null,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  });

  return { id: reservationId, status: newStatus };
}

/**
 * Delete a reservation (admin hard delete)
 */
export async function deleteReservation(reservationId, slotId = null) {
  if (slotId) {
    const slotRef = doc(db, "slots", slotId);
    const slotSnap = await getDoc(slotRef);
    if (slotSnap.exists() && slotSnap.data().reservationId === reservationId) {
      await updateDoc(slotRef, {
        status: "available",
        reservationId: null,
        reservedBy: null,
      });
    }
  }
  await deleteDoc(doc(db, "reservations", reservationId));
  return true;
}

/* =========================================================
   4. USERS MANAGEMENT
========================================================= */

/**
 * Fetch all users
 */
export async function getUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({
    uid: d.id,
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Real-time subscription to users
 */
export function subscribeUsers(onSuccess, onError) {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const users = snapshot.docs.map((d) => ({
        uid: d.id,
        id: d.id,
        ...d.data(),
      }));
      onSuccess(users);
    },
    (err) => {
      console.error("Error subscribing to users:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetch user profile & role
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() };
}

/* =========================================================
   5. LIVE DASHBOARD AGGREGATE LISTENER
========================================================= */

/**
 * Multi-collection live snapshot listener for the Admin Dashboard
 * Subscribes to locations, slots, reservations, and users simultaneously
 * and emits real-time combined statistics.
 */
export function subscribeDashboardStats(onStatsUpdate, onError) {
  let locations = [];
  let slots = [];
  let reservations = [];
  let users = [];

  const compute = () => {
    const totalLocations = locations.length;
    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => (s.status || "").toLowerCase() === "available").length;
    const reservedSlots = slots.filter((s) => (s.status || "").toLowerCase() === "reserved").length;
    const maintenanceSlots = slots.filter((s) => (s.status || "").toLowerCase() === "maintenance").length;

    // Active reservations are those with status "confirmed" or "active"
    const activeReservations = reservations.filter((r) => {
      const st = (r.status || "").toLowerCase();
      return st === "confirmed" || st === "active";
    }).length;

    const completedReservations = reservations.filter(
      (r) => (r.status || "").toLowerCase() === "completed"
    ).length;

    const cancelledReservations = reservations.filter(
      (r) => (r.status || "").toLowerCase() === "cancelled"
    ).length;

    // Calculate total revenue from non-cancelled reservations
    const totalRevenue = reservations.reduce((sum, r) => {
      const st = (r.status || "").toLowerCase();
      if (st === "cancelled") return sum;
      const amt = Number(r.amount ?? r.totalAmount ?? 0);
      return sum + amt;
    }, 0);

    const totalUsers = users.length;

    // Recent 5-10 reservations
    const recentReservations = reservations.slice(0, 8);

    onStatsUpdate({
      totalLocations,
      totalSlots,
      availableSlots,
      reservedSlots,
      maintenanceSlots,
      activeReservations,
      completedReservations,
      cancelledReservations,
      totalReservations: reservations.length,
      totalUsers,
      totalRevenue,
      recentReservations,
      locations,
      slots,
      reservations,
      users,
      loading: false,
    });
  };

  const unsubLocations = onSnapshot(
    collection(db, "locations"),
    (snap) => {
      locations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      compute();
    },
    onError
  );

  const unsubSlots = onSnapshot(
    collection(db, "slots"),
    (snap) => {
      slots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      compute();
    },
    onError
  );

  const unsubReservations = onSnapshot(
    collection(db, "reservations"),
    (snap) => {
      reservations = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        amount: Number(d.data().amount ?? d.data().totalAmount ?? 0),
        totalAmount: Number(d.data().totalAmount ?? d.data().amount ?? 0),
      }));
      reservations.sort((a, b) =>
        `${b.date || ""}${b.startTime || ""}`.localeCompare(`${a.date || ""}${a.startTime || ""}`)
      );
      compute();
    },
    onError
  );

  const unsubUsers = onSnapshot(
    collection(db, "users"),
    (snap) => {
      users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      compute();
    },
    onError
  );

  // Return master unsubscribe function
  return () => {
    unsubLocations();
    unsubSlots();
    unsubReservations();
    unsubUsers();
  };
}
