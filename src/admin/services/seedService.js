/**
 * ParkLink Admin Module - Database Seeder
 * Populates Firestore with realistic sample locations, slots, users, and reservations
 * for immediate testing of dashboard metrics, management tables, and reports.
 */

import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";

export const SAMPLE_LOCATIONS = [
  {
    id: "loc-colombo-1",
    name: "Colombo City Centre Deck",
    address: "137 Sir James Pieris Mawatha, Colombo 02",
    city: "Colombo",
    totalSlots: 24,
    pricePerHour: 150,
    price: 150,
    status: "active",
    description: "Multi-level covered smart parking deck with automated boom gates and EV fast-charging stations.",
    features: ["Covered Parking", "EV Fast Charging", "24/7 CCTV", "Security Guards", "Elevator Access"],
  },
  {
    id: "loc-colombo-2",
    name: "One Galle Face Premium Bays",
    address: "1A Centre Road, Colombo 01",
    city: "Colombo",
    totalSlots: 30,
    pricePerHour: 200,
    price: 200,
    status: "active",
    description: "Luxury mall underground parking with direct access to luxury retail, cinema, and dining.",
    features: ["Underground Covered", "Valet Option", "EV Superchargers", "Disabled Access", "Car Wash Available"],
  },
  {
    id: "loc-kandy-1",
    name: "Kandy City Centre Car Park",
    address: "5 Dalada Veediya, Kandy Central",
    city: "Kandy",
    totalSlots: 20,
    pricePerHour: 120,
    price: 120,
    status: "active",
    description: "Centrally located multi-story parking facility within walking distance to Dalada Maligawa.",
    features: ["Covered", "CCTV Monitoring", "Disabled Friendly", "Easy City Access"],
  },
  {
    id: "loc-galle-1",
    name: "Galle Fort Heritage Park",
    address: "Rampart Street, Galle Fort",
    city: "Galle",
    totalSlots: 15,
    pricePerHour: 100,
    price: 100,
    status: "active",
    description: "Scenic parking area with ocean breeze and easy walking access to the historic UNESCO Fort.",
    features: ["Open Air", "Ocean View", "Security Guard", "Tourist Zone"],
  },
];

export const SAMPLE_USERS = [
  {
    uid: "seed-user-1",
    name: "Kasun Perera",
    email: "kasun.perera@example.com",
    role: "user",
    phone: "+94 77 123 4567",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    uid: "seed-user-2",
    name: "Dilini Fernando",
    email: "dilini.f@example.com",
    role: "user",
    phone: "+94 71 987 6543",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    uid: "seed-user-3",
    name: "Nuwan Silva",
    email: "nuwan.silva@example.com",
    role: "user",
    phone: "+94 76 555 4321",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    uid: "seed-user-4",
    name: "Tharushi Wijesinghe",
    email: "tharushi.w@example.com",
    role: "user",
    phone: "+94 75 444 8899",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    uid: "seed-user-5",
    name: "Amila Bandara",
    email: "amila.b@example.com",
    role: "user",
    phone: "+94 78 333 1122",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

/**
 * Generate dates relative to today
 */
function getRelativeDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Seed all collections with rich test data
 */
export async function seedParkingSystemData(currentAdminUser = null) {
  const batch1 = writeBatch(db);
  const nowIso = new Date().toISOString();

  // 1. Seed Locations
  for (const loc of SAMPLE_LOCATIONS) {
    const locRef = doc(db, "locations", loc.id);
    batch1.set(locRef, {
      ...loc,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  // 2. Seed Users
  for (const usr of SAMPLE_USERS) {
    const usrRef = doc(db, "users", usr.uid);
    batch1.set(usrRef, {
      ...usr,
      createdAt: usr.createdAt || nowIso,
    });
  }

  // Ensure current admin user doc exists with role: "admin"
  if (currentAdminUser?.uid) {
    const adminRef = doc(db, "users", currentAdminUser.uid);
    batch1.set(
      adminRef,
      {
        name: currentAdminUser.displayName || currentAdminUser.email?.split("@")[0] || "System Admin",
        email: currentAdminUser.email || "admin@parklink.com",
        role: "admin",
        createdAt: nowIso,
      },
      { merge: true }
    );
  }

  await batch1.commit();

  // 3. Seed Slots
  const batch2 = writeBatch(db);
  const slotsList = [];

  for (const loc of SAMPLE_LOCATIONS) {
    // Generate slots: Standard cars, EV, Bike, Disabled
    const configs = [
      { prefix: "A", count: 8, type: "car", floor: "Ground Floor" },
      { prefix: "B", count: 6, type: "car", floor: "Level 1" },
      { prefix: "EV", count: 3, type: "EV", floor: "Ground Floor" },
      { prefix: "BK", count: 4, type: "bike", floor: "Ground Floor" },
      { prefix: "DIS", count: 2, type: "disabled", floor: "Ground Floor" },
    ];

    let idx = 0;
    for (const conf of configs) {
      for (let i = 1; i <= conf.count; i++) {
        idx++;
        const slotNumber = `${conf.prefix}-${String(i).padStart(2, "0")}`;
        const slotId = `slot-${loc.id}-${slotNumber}`.toLowerCase();
        const slotRef = doc(db, "slots", slotId);

        // Mix statuses: mostly available, some reserved, one maintenance
        let status = "available";
        if (idx === 2 || idx === 7) status = "reserved";
        else if (idx === 15) status = "maintenance";

        const slotData = {
          id: slotId,
          locationId: loc.id,
          locationName: loc.name,
          slotNumber,
          lane: conf.prefix,
          floor: conf.floor,
          type: conf.type,
          status,
          price: conf.type === "EV" ? loc.pricePerHour + 50 : conf.type === "bike" ? Math.round(loc.pricePerHour * 0.5) : loc.pricePerHour,
          createdAt: nowIso,
        };

        batch2.set(slotRef, slotData);
        slotsList.push(slotData);
      }
    }
  }

  await batch2.commit();

  // 4. Seed Reservations (Spread across past 14 days, today, and tomorrow)
  const batch3 = writeBatch(db);

  const reservationScenarios = [
    // Today bookings (Active & Confirmed)
    {
      locIdx: 0,
      slotNum: "A-02",
      user: SAMPLE_USERS[0],
      dayOffset: 0,
      startTime: "09:00",
      endTime: "12:00",
      hours: 3,
      status: "confirmed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 1,
      slotNum: "EV-01",
      user: SAMPLE_USERS[1],
      dayOffset: 0,
      startTime: "10:30",
      endTime: "13:30",
      hours: 3,
      status: "confirmed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 0,
      slotNum: "B-03",
      user: SAMPLE_USERS[2],
      dayOffset: 0,
      startTime: "14:00",
      endTime: "18:00",
      hours: 4,
      status: "pending",
      paymentStatus: "pay_at_location",
      method: "cash",
    },
    // Past days (Completed and some Cancelled)
    {
      locIdx: 0,
      slotNum: "A-01",
      user: SAMPLE_USERS[0],
      dayOffset: -1,
      startTime: "08:30",
      endTime: "11:30",
      hours: 3,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 1,
      slotNum: "B-02",
      user: SAMPLE_USERS[3],
      dayOffset: -1,
      startTime: "13:00",
      endTime: "17:00",
      hours: 4,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 2,
      slotNum: "A-04",
      user: SAMPLE_USERS[4],
      dayOffset: -2,
      startTime: "09:00",
      endTime: "11:00",
      hours: 2,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "cash",
    },
    {
      locIdx: 3,
      slotNum: "A-02",
      user: SAMPLE_USERS[1],
      dayOffset: -2,
      startTime: "15:00",
      endTime: "18:00",
      hours: 3,
      status: "cancelled",
      paymentStatus: "refunded",
      method: "card",
    },
    {
      locIdx: 0,
      slotNum: "EV-02",
      user: SAMPLE_USERS[2],
      dayOffset: -3,
      startTime: "11:00",
      endTime: "14:00",
      hours: 3,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 1,
      slotNum: "A-05",
      user: SAMPLE_USERS[3],
      dayOffset: -4,
      startTime: "08:00",
      endTime: "13:00",
      hours: 5,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 2,
      slotNum: "BK-01",
      user: SAMPLE_USERS[0],
      dayOffset: -5,
      startTime: "10:00",
      endTime: "12:00",
      hours: 2,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "cash",
    },
    {
      locIdx: 0,
      slotNum: "DIS-01",
      user: SAMPLE_USERS[4],
      dayOffset: -6,
      startTime: "14:30",
      endTime: "17:30",
      hours: 3,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 1,
      slotNum: "A-03",
      user: SAMPLE_USERS[1],
      dayOffset: -7,
      startTime: "12:00",
      endTime: "16:00",
      hours: 4,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 2,
      slotNum: "A-02",
      user: SAMPLE_USERS[2],
      dayOffset: -9,
      startTime: "09:00",
      endTime: "13:00",
      hours: 4,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 0,
      slotNum: "B-01",
      user: SAMPLE_USERS[3],
      dayOffset: -11,
      startTime: "16:00",
      endTime: "20:00",
      hours: 4,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
    {
      locIdx: 3,
      slotNum: "A-01",
      user: SAMPLE_USERS[0],
      dayOffset: -13,
      startTime: "11:00",
      endTime: "15:00",
      hours: 4,
      status: "completed",
      paymentStatus: "mock_paid",
      method: "card",
    },
  ];

  let resIndex = 0;
  for (const s of reservationScenarios) {
    resIndex++;
    const loc = SAMPLE_LOCATIONS[s.locIdx];
    const targetSlot = slotsList.find((sl) => sl.locationId === loc.id && sl.slotNumber === s.slotNum) || {
      id: `slot-${loc.id}-${s.slotNum}`.toLowerCase(),
      type: "car",
      price: loc.pricePerHour,
    };

    const resId = `res-demo-${String(resIndex).padStart(3, "0")}`;
    const resRef = doc(db, "reservations", resId);
    const dateStr = getRelativeDateStr(s.dayOffset);
    const rate = Number(targetSlot.price || loc.pricePerHour);
    const amount = rate * s.hours;

    batch3.set(resRef, {
      userId: s.user.uid,
      userName: s.user.name,
      userEmail: s.user.email,
      locationId: loc.id,
      locationName: loc.name,
      slotId: targetSlot.id,
      slotNumber: s.slotNum,
      slotType: targetSlot.type,
      date: dateStr,
      startTime: s.startTime,
      endTime: s.endTime,
      durationHours: s.hours,
      hourlyRate: rate,
      amount,
      totalAmount: amount,
      paymentMethod: s.method,
      paymentStatus: s.paymentStatus,
      paymentReference: `PL-${resId.slice(4).toUpperCase()}`,
      status: s.status,
      createdAt: new Date(new Date(`${dateStr}T${s.startTime}:00`).getTime() - 2 * 3600000).toISOString(),
    });
  }

  await batch3.commit();

  return {
    success: true,
    locationsCount: SAMPLE_LOCATIONS.length,
    usersCount: SAMPLE_USERS.length + (currentAdminUser ? 1 : 0),
    slotsCount: slotsList.length,
    reservationsCount: reservationScenarios.length,
  };
}
