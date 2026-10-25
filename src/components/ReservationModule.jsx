import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where
} from "firebase/firestore";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  CircleAlert,
  CheckCircle2,
  XCircle,
  CarFront,
  RefreshCw
} from "lucide-react";
import { db } from "../firebase";

const todayLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;

const initialBookingTime = () => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  if (now.getHours() >= 23) {
    now.setDate(now.getDate() + 1);
    now.setHours(8, 0, 0, 0);
  }
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000).toISOString();
  return { date: local.slice(0, 10), startTime: local.slice(11, 16) };
};

const timeHours = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
};

export default function ReservationModule({ user, location, slot, onRefresh }) {
  const [initialTime] = useState(initialBookingTime);
  const [date, setDate] = useState(initialTime.date);
  const [startTime, setStartTime] = useState(initialTime.startTime);
  const [endTime, setEndTime] = useState(() => {
    const [h, m] = initialTime.startTime.split(":").map(Number);
    const next = (h * 60 + m + 60) % (24 * 60);
    return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
  });
  const [extensionTimes, setExtensionTimes] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [reservations, setReservations] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const hours = useMemo(() => timeHours(startTime, endTime), [startTime, endTime]);
  const hourlyRate = Number(location?.price || slot?.price || 150);
  const total = Math.ceil(hours * hourlyRate);

  const loadReservations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "reservations"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      rows.sort((a, b) => `${b.date || ""}${b.startTime || ""}`.localeCompare(`${a.date || ""}${a.startTime || ""}`));
      setReservations(rows);
    } catch (err) {
      console.error("Could not load reservations:", err);
      setNotice({ type: "error", text: "Your reservations could not be loaded. Check your Firestore rules and connection." });
    }
  }, [user?.uid]);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const bookAndPay = async (event) => {
    event.preventDefault();
    setNotice({ type: "", text: "" });
    if (!user?.uid) return setNotice({ type: "error", text: "Please sign in before making a reservation." });
    if (!location || !slot) return setNotice({ type: "error", text: "Choose a parking hub and an available bay first." });
    if (endTime <= startTime) return setNotice({ type: "error", text: "End time must be later than start time." });
    if (date < todayLocal()) return setNotice({ type: "error", text: "Choose today or a future date." });
    if (date === todayLocal()) {
      const [h, m] = startTime.split(":").map(Number);
      const start = new Date(); start.setHours(h, m, 0, 0);
      if (start <= new Date()) return setNotice({ type: "error", text: "Choose a start time in the future." });
    }
    if (slot.isPersisted !== true) {
      return setNotice({ type: "error", text: "This is a sample bay, not a Firestore record. Create a real document in the slots collection, then refresh the dashboard." });
    }
    setBusy(true);
    try {
      const slotRef = doc(db, "slots", slot.id);
      const reservationRef = doc(collection(db, "reservations"));
      await runTransaction(db, async (transaction) => {
        const freshSlot = await transaction.get(slotRef);
        if (!freshSlot.exists()) throw new Error("This parking bay no longer exists. Refresh the dashboard.");
        const freshData = freshSlot.data();
        if (String(freshData.status || "available").toLowerCase() !== "available") {
          throw new Error("This bay has just been reserved or is occupied. Select another available bay.");
        }
        const reservationData = {
          userId: user.uid,
          userEmail: user.email || "",
          locationId: location.id,
          locationName: location.name,
          slotId: slot.id,
          slotNumber: freshData.slotNumber || slot.slotNumber || slot.id,
          slotType: freshData.type || slot.type || "Standard",
          date,
          startTime,
          endTime,
          durationHours: Number(hours.toFixed(2)),
          hourlyRate,
          totalAmount: total,
          paymentMethod,
          paymentStatus: paymentMethod === "card" ? "mock_paid" : "pay_at_location",
          paymentReference: `PL-${reservationRef.id.slice(0, 8).toUpperCase()}`,
          status: "confirmed",
          extensionHistory: [],
          createdAt: new Date().toISOString()
        };
        transaction.set(reservationRef, reservationData);
        transaction.update(slotRef, {
          status: "reserved",
          reservedBy: user.uid,
          reservationId: reservationRef.id
        });
      });
      setNotice({ type: "success", text: `Reservation confirmed. Demo payment recorded (${money(total)}). Reference: PL-${reservationRef.id.slice(0, 8).toUpperCase()}.` });
      await loadReservations();
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Reservation/payment failed:", err);
      setNotice({ type: "error", text: err.message || "Could not complete reservation. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const cancelReservation = async (reservation) => {
    if (!window.confirm(`Cancel reservation ${reservation.slotNumber || ""} on ${reservation.date}?`)) return;
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const reservationRef = doc(db, "reservations", reservation.id);
      const slotRef = doc(db, "slots", reservation.slotId);
      await runTransaction(db, async (transaction) => {
        const [reservationSnap, slotSnap] = await Promise.all([
          transaction.get(reservationRef), transaction.get(slotRef)
        ]);
        if (!reservationSnap.exists()) throw new Error("Reservation not found.");
        const saved = reservationSnap.data();
        if (saved.userId !== user.uid) throw new Error("You can only cancel your own reservations.");
        if (saved.status !== "confirmed") throw new Error("Only confirmed reservations can be cancelled.");
        transaction.update(reservationRef, { status: "cancelled" });
        if (slotSnap.exists() && slotSnap.data().reservationId === reservation.id) {
          transaction.update(slotRef, { status: "available", reservedBy: null, reservationId: null });
        }
      });
      setNotice({ type: "success", text: "Reservation cancelled and the bay lock released. Demo payments are not real charges." });
      await loadReservations();
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Cancellation failed:", err);
      setNotice({ type: "error", text: err.message || "Could not cancel this reservation." });
    } finally {
      setBusy(false);
    }
  };

  const extendReservation = async (reservation) => {
    const newEndTime = extensionTimes[reservation.id];
    const addedHours = timeHours(reservation.endTime, newEndTime);
    if (!newEndTime || addedHours <= 0) {
      setNotice({ type: "error", text: "Choose an end time later than the current reservation end time." });
      return;
    }
    if (new Date(`${reservation.date}T${newEndTime}`) <= new Date()) {
      setNotice({ type: "error", text: "The new end time must be in the future." });
      return;
    }

    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const reservationRef = doc(db, "reservations", reservation.id);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reservationRef);
        if (!snapshot.exists()) throw new Error("Reservation not found.");
        const saved = snapshot.data();
        if (saved.userId !== user.uid || saved.status !== "confirmed") {
          throw new Error("Only your confirmed reservations can be extended.");
        }
        const addedAmount = Number((addedHours * Number(saved.hourlyRate || 0)).toFixed(2));
        transaction.update(reservationRef, {
          endTime: newEndTime,
          durationHours: Number((Number(saved.durationHours || 0) + addedHours).toFixed(2)),
          totalAmount: Number((Number(saved.totalAmount || 0) + addedAmount).toFixed(2)),
          extensionHistory: [...(saved.extensionHistory || []), {
            previousEndTime: saved.endTime,
            newEndTime,
            addedHours,
            addedAmount,
            extendedAt: new Date().toISOString(),
          }],
          updatedAt: new Date().toISOString(),
        });
      });
      setNotice({ type: "success", text: "Parking time extended and booking history updated." });
      await loadReservations();
    } catch (err) {
      console.error("Extension failed:", err);
      setNotice({ type: "error", text: err.message || "Could not extend this reservation." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="reservation-module dash-section" id="reservation-section">
      <div className="dash-section-header">
        <div>
          <span className="dash-section-tag">MEMBER 2 · RESERVATION & PAYMENT</span>
          <h2>Reserve your parking bay</h2>
          <p className="reservation-subtitle">Choose a time, review the price, and confirm with the demo payment flow.</p>
        </div>
        <span className="reservation-secure-label"><ShieldCheck size={16} /> Transaction protected</span>
      </div>

      {notice.text && <div className={`reservation-notice ${notice.type}`} role="status">
        {notice.type === "success" ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
        <span>{notice.text}</span>
        <button type="button" aria-label="Dismiss message" onClick={() => setNotice({ type: "", text: "" })}>×</button>
      </div>}

      <div className="reservation-columns">
        <form className="reservation-card" onSubmit={bookAndPay}>
          <div className="reservation-card-heading"><span className="reservation-step-icon"><CalendarDays size={20} /></span><div><h3>Booking details</h3><p>Reservation availability and price estimate</p></div></div>
          <div className="reservation-selected-bay">
            <div className="reservation-car-icon"><CarFront size={24} /></div>
            <div><strong>{slot ? (slot.slotNumber || slot.id) : "No bay selected"}</strong><span>{location?.name || "Choose a parking hub and bay above"}</span></div>
            <span className={`reservation-status ${slot?.status === "available" ? "is-available" : ""}`}>{slot ? (slot.status || "available") : "Waiting"}</span>
          </div>
          <div className="reservation-form-grid">
            <label className="reservation-field reservation-field-wide">Parking date<input type="date" min={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} required /></label>
            <label className="reservation-field">Start time<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></label>
            <label className="reservation-field">End time<input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required /></label>
          </div>
          <div className="reservation-price-box">
            <div><span>Hourly rate</span><strong>{money(hourlyRate)} <small>/ hour</small></strong></div>
            <div><span>Duration</span><strong>{hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : "Choose valid times"}</strong></div>
            <div className="reservation-total"><span>Estimated total</span><strong>{money(total)}</strong></div>
          </div>
          <div className="reservation-card-heading payment-heading"><span className="reservation-step-icon"><CreditCard size={20} /></span><div><h3>Payment method</h3><p>Demo payment only — no real money is charged</p></div></div>
          <div className="payment-method-options">
            <label className={paymentMethod === "card" ? "payment-method selected" : "payment-method"}><input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={(e) => setPaymentMethod(e.target.value)} /><CreditCard size={19} /><span><strong>Card (demo)</strong><small>Simulated successful payment</small></span></label>
            <label className={paymentMethod === "cash" ? "payment-method selected" : "payment-method"}><input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === "cash"} onChange={(e) => setPaymentMethod(e.target.value)} /><ReceiptText size={19} /><span><strong>Pay at location</strong><small>Recorded as demo payment</small></span></label>
          </div>
          <button className="btn btn-primary reservation-submit" type="submit" disabled={busy || !slot || !location || slot.isPersisted !== true || hours <= 0 || slot.status?.toLowerCase() !== "available"}>
            {busy ? <><RefreshCw size={17} className="reservation-spin" /> Processing…</> : <><ShieldCheck size={17} /> Confirm reservation · {money(total)}</>}
          </button>
          {slot && slot.isPersisted !== true && <p className="reservation-disclaimer">This is a sample bay. Booking is enabled only for real documents in Firestore's <code>slots</code> collection.</p>}
          <p className="reservation-disclaimer">A transaction checks and locks the selected bay before saving the reservation, helping prevent two users booking the same bay at once.</p>
        </form>

        <aside className="reservation-card reservation-help-card">
          <div className="reservation-card-heading"><span className="reservation-step-icon"><ShieldCheck size={20} /></span><div><h3>Booking & payment summary</h3><p>What happens after confirmation</p></div></div>
          <ul className="reservation-check-list">
            <li><CheckCircle2 size={17} /><span><strong>Availability check</strong><small>The bay status is checked again on the server before confirmation.</small></span></li>
            <li><CheckCircle2 size={17} /><span><strong>Reservation reference</strong><small>A unique payment/reference code is generated for your record.</small></span></li>
            <li><CheckCircle2 size={17} /><span><strong>Payment status</strong><small>The project stores a mock payment status, not real card details.</small></span></li>
            <li><CheckCircle2 size={17} /><span><strong>My Reservations</strong><small>Confirmed and cancelled bookings appear below.</small></span></li>
          </ul>
          <div className="reservation-warning"><CircleAlert size={18} /><p><strong>Demo limitation</strong><br />The current Firestore rules lock a bay for one active reservation until it is cancelled. Date/time overlap-based reuse requires a later schema/rules update.</p></div>
        </aside>
      </div>

      <div className="my-reservations-panel" id="my-reservations">
        <div className="my-reservations-heading"><div><span className="dash-section-tag">BOOKING HISTORY</span><h2>My Reservations</h2><p>View your booking details, payment reference, and status.</p></div><button type="button" className="btn btn-outline btn-sm" onClick={loadReservations} disabled={busy}><RefreshCw size={15} /> Refresh</button></div>
        {reservations.length === 0 ? <div className="reservations-empty"><CalendarDays size={30} /><h3>No reservations yet</h3><p>Your confirmed parking bookings will appear here after you complete a reservation.</p></div> : <div className="reservation-list">
          {reservations.map((item) => <article className="reservation-ticket" key={item.id}>
            <div className="ticket-leading-icon"><CarFront size={23} /></div>
            <div className="ticket-main"><div className="ticket-title-row"><h3>{item.locationName || "Parking location"}</h3><span className={`ticket-status ${item.status === "confirmed" ? "confirmed" : "cancelled"}`}>{item.status || "pending"}</span></div>
              <p className="ticket-bay">Bay {item.slotNumber || item.slotId} · {item.slotType || "Standard"}</p>
              <div className="ticket-details"><span><CalendarDays size={14} /> {item.date}</span><span><Clock3 size={14} /> {item.startTime}–{item.endTime}</span><span><CreditCard size={14} /> {item.paymentStatus || "unpaid"}</span></div>
              <small className="ticket-reference">Reference: {item.paymentReference || item.id}</small>
            </div>
            <div className="ticket-total"><strong>{money(item.totalAmount)}</strong><span>{item.durationHours || 0} hour(s)</span>
              {item.status === "confirmed" && <div className="ticket-actions">
                <label className="extension-time-label">Extend until
                  <input type="time" min={item.endTime} value={extensionTimes[item.id] || item.endTime} onChange={(e) => setExtensionTimes((old) => ({ ...old, [item.id]: e.target.value }))} />
                </label>
                <button type="button" className="ticket-extend-btn" disabled={busy} onClick={() => extendReservation(item)}>Extend time</button>
                <button type="button" className="ticket-cancel-btn" disabled={busy} onClick={() => cancelReservation(item)}><XCircle size={15} /> Cancel</button>
              </div>}
            </div>
          </article>)}
        </div>}
      </div>
    </section>
  );
}
