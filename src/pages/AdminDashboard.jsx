import React, { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { AlertCircle, CheckCircle2, Database, Plus, RefreshCw } from "lucide-react";
import { db } from "../firebase";
import DashboardNavbar from "../components/layout/DashboardNavbar";
import { DEFAULT_LOCATIONS } from "../data/parkingData";

export default function AdminDashboard({ user }) {
  const [locations, setLocations] = useState([]);
  const [slotCounts, setSlotCounts] = useState({});
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [laneCount, setLaneCount] = useState(3);
  const [slotsPerLane, setSlotsPerLane] = useState(6);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const loadParkingData = async () => {
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const [locationsSnapshot, slotsSnapshot] = await Promise.all([
        getDocs(collection(db, "locations")),
        getDocs(collection(db, "slots"))
      ]);
      const loadedLocations = locationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const availableLocations = loadedLocations.length > 0 ? loadedLocations : DEFAULT_LOCATIONS;
      const counts = slotsSnapshot.docs.reduce((result, item) => {
        const locationId = item.data().locationId;
        result[locationId] = (result[locationId] || 0) + 1;
        return result;
      }, {});
      setLocations(availableLocations);
      setSlotCounts(counts);
      setSelectedLocationId((current) => current || availableLocations[0]?.id || "");
    } catch (error) {
      console.error("Unable to load parking setup:", error);
      setLocations(DEFAULT_LOCATIONS);
      setNotice({ type: "error", text: "Parking setup could not be loaded. Check your connection and admin access." });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadParkingData();
  }, []);

  const addParkingSlots = async (event) => {
    event.preventDefault();
    const location = locations.find((item) => item.id === selectedLocationId);
    if (!location) return;

    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const existingSnapshot = await getDocs(collection(db, "slots"));
      const existingNumbers = new Set(
        existingSnapshot.docs
          .filter((item) => item.data().locationId === location.id)
          .map((item) => item.data().slotNumber)
      );
      const lanes = ["A", "B", "C"].slice(0, Number(laneCount));
      let addedCount = 0;

      for (const lane of lanes) {
        for (let index = 1; index <= Number(slotsPerLane); index += 1) {
          const slotNumber = `${lane}-${String(index).padStart(2, "0")}`;
          if (existingNumbers.has(slotNumber)) continue;
          await addDoc(collection(db, "slots"), {
            locationId: location.id,
            locationName: location.name,
            slotNumber,
            lane,
            floor: "Level 1",
            type: index === 1 || index === Number(slotsPerLane) ? "EV Charging" : "Standard",
            price: Number(location.price || 150),
            status: "available",
            createdAt: new Date().toISOString(),
            createdBy: user.uid
          });
          addedCount += 1;
        }
      }

      setNotice({
        type: "success",
        text: addedCount > 0 ? `${addedCount} parking slots added to ${location.name}.` : "Those parking slots already exist for this location."
      });
      await loadParkingData();
    } catch (error) {
      console.error("Unable to add parking slots:", error);
      setNotice({ type: "error", text: error.message || "Parking slots could not be added." });
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      <DashboardNavbar user={user} admin />

      <main className="dashboard-main-content">
        <div className="container">
          <div className="dash-welcome-header">
            <div>
              <span className="welcome-badge badge-admin">ADMIN DASHBOARD</span>
              <h1>Welcome, Admin</h1>
              <p>System Administrator Control & Overview</p>
            </div>
          </div>

          {notice.text && (
            <div className={`alert-box ${notice.type === "success" ? "alert-success" : "alert-error"} mb-4`}>
              {notice.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{notice.text}</span>
            </div>
          )}

          <section className="dash-section">
            <div className="dash-section-header">
              <div>
                <span className="dash-section-tag">PARKING SETUP</span>
                <h2>Add parking slots</h2>
                <p>Create real Firestore slots that drivers can reserve and see in booking history.</p>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={loadParkingData} disabled={busy}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>

            <form className="reservation-card" onSubmit={addParkingSlots}>
              <div className="reservation-form-grid">
                <label className="reservation-field reservation-field-wide">
                  Parking location
                  <select value={selectedLocationId} onChange={(event) => setSelectedLocationId(event.target.value)} required>
                    <option value="">Select a location</option>
                    {locations.map((location) => <option value={location.id} key={location.id}>{location.name}</option>)}
                  </select>
                </label>
                <label className="reservation-field">
                  Lanes
                  <select value={laneCount} onChange={(event) => setLaneCount(event.target.value)}>
                    <option value="1">1 lane</option>
                    <option value="2">2 lanes</option>
                    <option value="3">3 lanes</option>
                  </select>
                </label>
                <label className="reservation-field">
                  Slots per lane
                  <input type="number" min="1" max="20" value={slotsPerLane} onChange={(event) => setSlotsPerLane(event.target.value)} />
                </label>
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy || !selectedLocationId}>
                {busy ? <RefreshCw size={17} className="reservation-spin" /> : <Plus size={17} />}
                Add available parking slots
              </button>
            </form>

            <div className="dash-stats-grid mt-4">
              {locations.map((location) => (
                <div className="stat-card-modern" key={location.id}>
                  <div className="stat-icon-wrap stat-blue"><Database size={22} /></div>
                  <div className="stat-info">
                    <span className="stat-label">{location.name}</span>
                    <strong className="stat-number">{slotCounts[location.id] || 0}</strong>
                    <span className="stat-hint">Real Firestore slots</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
export { AdminDashboard };
