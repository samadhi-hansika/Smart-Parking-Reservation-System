import React, { useState, useEffect, useMemo } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";
import {
  Search,
  AlertCircle,
  Building2,
  CarFront,
  Zap,
  X,
  MapPin,
  Car,
  Check
} from "lucide-react";

import { db } from "../firebase";
import { DEFAULT_LOCATIONS, generateFallbackSlots } from "../data/parkingData";
import DashboardNavbar from "../components/layout/DashboardNavbar";
import Btn from "../components/common/Btn";
import ReservationModule from "../components/ReservationModule";

export default function UserDashboard({ user }) {
  const [profile, setProfile] = useState({ name: "", email: user?.email || "" });
  const [locations, setLocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  const loadDashboard = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError("");

    try {
      const [profileSnapshot, locationsSnapshot, slotsSnapshot] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDocs(collection(db, "locations")),
        getDocs(collection(db, "slots"))
      ]);

      const savedProfile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      const loadedLocations = locationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const loadedSlots = slotsSnapshot.docs.map((item) => {
        const data = item.data();
        return {
          ...data,
          id: item.id,
          status: String(data.status || "available").toLowerCase(),
          isPersisted: true,
        };
      });

      setProfile({
        name: savedProfile.name || user.displayName || user.email?.split("@")[0] || "Driver",
        email: savedProfile.email || user.email || ""
      });

      if (loadedLocations.length > 0) {
        setLocations(loadedLocations);
        setSlots(loadedSlots);
      } else {
        setLocations(DEFAULT_LOCATIONS);
        const fallbackSlots = DEFAULT_LOCATIONS.flatMap((loc) => generateFallbackSlots(loc.id).map((slot) => ({ ...slot, isPersisted: false })));
        setSlots(fallbackSlots);
      }
    } catch (loadError) {
      console.error("Unable to load user dashboard:", loadError);
      setLocations(DEFAULT_LOCATIONS);
      const fallbackSlots = DEFAULT_LOCATIONS.flatMap((loc) => generateFallbackSlots(loc.id).map((slot) => ({ ...slot, isPersisted: false })));
      setSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.uid]);

  // Keep the selected bay in sync after a reservation locks/unlocks its Firestore document.
  useEffect(() => {
    if (!selectedSlot?.id) return;
    const latestSlot = slots.find((item) => item.id === selectedSlot.id);
    if (latestSlot && latestSlot !== selectedSlot) setSelectedSlot(latestSlot);
  }, [slots, selectedSlot?.id]);

  const filteredLocations = useMemo(() => {
    if (!searchFilter.trim()) return locations;
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.address?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.city?.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [locations, searchFilter]);

  // Available slots for selected location
  const currentSlots = useMemo(() => {
    if (!selectedLocation) return [];
    const locSlots = slots.filter((slot) => slot.locationId === selectedLocation.id);
    if (locSlots.length > 0) return locSlots;
    return generateFallbackSlots(selectedLocation.id).map((slot) => ({ ...slot, isPersisted: false }));
  }, [selectedLocation, slots]);

  const totalSlotsCount = useMemo(() => {
    if (slots.length > 0) return slots.length;
    return locations.reduce((sum, l) => sum + (Number(l.totalSlots) || 20), 0);
  }, [slots, locations]);

  const availableSlotsCount = useMemo(() => {
    const free = slots.filter((slot) => slot.status?.toLowerCase() === "available");
    if (free.length > 0) return free.length;
    return locations.reduce((sum, l) => sum + (Number(l.availableSlots) || 8), 0);
  }, [slots, locations]);

  return (
    <div className="dashboard-page-wrapper">
      <DashboardNavbar user={user} />

      <main className="dashboard-main-content">
        <div className="container">
          {/* Welcome Header */}
          <div className="dash-welcome-header">
            <div className="welcome-texts">
              <span className="welcome-badge">DRIVER DASHBOARD</span>
              <h1>Welcome back, {profile.name}! 👋</h1>
              <p>Explore verified parking hubs and check real-time parking slot availability.</p>
            </div>

            <div className="welcome-quick-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const el = document.getElementById("locations-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Search size={16} />
                <span>Explore Parking Hubs</span>
              </button>
            </div>
          </div>

          {/* Feedback Notices */}
          {error && (
            <div className="alert-box alert-error mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button type="button" className="alert-close" onClick={() => setError("")}>×</button>
            </div>
          )}

          {/* Member 1 KPI Statistics */}
          <div className="dash-stats-grid">
            <div className="stat-card-modern">
              <div className="stat-icon-wrap stat-blue">
                <Building2 size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Active Parking Hubs</span>
                <strong className="stat-number">{loading ? "…" : locations.length}</strong>
                <span className="stat-hint">Monitored Locations</span>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrap stat-emerald">
                <CarFront size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Parking Bays</span>
                <strong className="stat-number">{loading ? "…" : totalSlotsCount}</strong>
                <span className="stat-hint">Across All Hubs</span>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrap stat-purple">
                <Zap size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Free Bays Available</span>
                <strong className="stat-number">{loading ? "…" : availableSlotsCount}</strong>
                <span className="stat-hint text-emerald">● Live Status</span>
              </div>
            </div>
          </div>

          {/* SECTION: PARKING LOCATIONS (Member 1: Locations Module) */}
          <section id="locations-section" className="dash-section">
            <div className="dash-section-header">
              <div>
                <span className="dash-section-tag">PARKING LOCATIONS</span>
                <h2>Parking Hubs in Network</h2>
              </div>
              <span className="dash-count-badge">{filteredLocations.length} Hubs</span>
            </div>

            {/* Live Search for Hubs */}
            <div className="filter-search-input mb-4" style={{ maxWidth: "420px" }}>
              <Search size={18} className="search-prefix-icon" />
              <input
                type="text"
                placeholder="Filter hubs by city or name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              {searchFilter && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchFilter("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Locations Cards Grid */}
            <div className="dash-locations-grid">
              {filteredLocations.map((loc) => {
                const locSlots = slots.filter((s) => s.locationId === loc.id);
                const freeCount = locSlots.length > 0
                  ? locSlots.filter((s) => s.status?.toLowerCase() === "available").length
                  : Number(loc.availableSlots) || 8;

                const isSelected = selectedLocation?.id === loc.id;

                return (
                  <div
                    key={loc.id}
                    className={`dash-loc-card ${isSelected ? "dash-loc-selected" : ""}`}
                  >
                    <div className="loc-card-header">
                      <div className="loc-icon-pill">
                        <MapPin size={18} />
                      </div>
                      <div className="loc-rate-badge">
                        Rs. {loc.price || 150} <small>/hr</small>
                      </div>
                    </div>

                    <h3 className="loc-card-name">{loc.name}</h3>
                    <p className="loc-card-address">{loc.address}</p>

                    <div className="loc-card-stats-row">
                      <span className="loc-spots-free">
                        <span className="dot dot-free"></span>
                        <strong>{freeCount}</strong> bays free
                      </span>
                      {loc.features && loc.features.includes("EV Fast Charging") && (
                        <span className="ev-badge-chip">⚡ EV Ready</span>
                      )}
                    </div>

                    <Btn
                      variant={isSelected ? "secondary" : "primary"}
                      size="sm"
                      className="full mt-3"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLocation(null);
                          setSelectedSlot(null);
                        } else {
                          setSelectedLocation(loc);
                          setSelectedSlot(null);
                          setTimeout(() => {
                            const el = document.getElementById("slots-section");
                            el?.scrollIntoView({ behavior: "smooth" });
                          }, 150);
                        }
                      }}
                    >
                      {isSelected ? "Hide Slots Layout" : "View Parking Slots →"}
                    </Btn>
                  </div>
                );
              })}
            </div>

            {/* SECTION: PARKING SLOTS (Member 1: Slots Module) */}
            {selectedLocation && (
              <div id="slots-section" className="visual-deck-panel">
                <div className="deck-panel-header">
                  <div>
                    <span className="section-badge">SLOTS MODULE</span>
                    <h2>{selectedLocation.name} • Parking Bays</h2>
                    <p className="deck-panel-sub">
                      Visual parking bay layout for <strong>{selectedLocation.address}</strong> (Rate: Rs. {selectedLocation.price || 150}/hr)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSelectedLocation(null);
                      setSelectedSlot(null);
                    }}
                  >
                    <X size={18} />
                    <span>Close View</span>
                  </button>
                </div>

                <div className="deck-interactive-body">
                  {/* Visual Bays Grid */}
                  <div className="interactive-bays-layout">
                    <div className="lane-header-row">
                      <span className="lane-title">ENTRY GATE ➔</span>
                      <div className="deck-legend-mini">
                        <span><span className="dot dot-free"></span> Available</span>
                        <span><span className="dot dot-selected"></span> Inspected</span>
                        <span><span className="dot dot-busy"></span> Occupied</span>
                        <span><span className="dot dot-ev"></span> EV Charging</span>
                      </div>
                    </div>

                    {/* Group slots into lanes */}
                    {["A", "B", "C"].map((laneLetter) => {
                      const laneSlots = currentSlots.filter(
                        (s) => (s.lane === laneLetter) || s.slotNumber?.startsWith(laneLetter)
                      );
                      const displaySlots = laneSlots;

                      return (
                        <div key={laneLetter} className="lane-row-group">
                          <span className="lane-side-label">LANE {laneLetter}</span>
                          <div className="lane-slots-flex">
                            {displaySlots.map((slot) => {
                              const isOccupied = slot.status?.toLowerCase() === "occupied" || slot.status?.toLowerCase() === "reserved";
                              const isChosen = (selectedSlot?.id || selectedSlot) === slot.id;
                              const isEV = slot.type?.toLowerCase().includes("ev");

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  className={`interactive-bay-box ${
                                    isOccupied
                                      ? "bay-occupied"
                                      : isChosen
                                      ? "bay-chosen"
                                      : isEV
                                      ? "bay-ev-available"
                                      : "bay-available"
                                  }`}
                                  onClick={() => setSelectedSlot(slot)}
                                >
                                  <div className="bay-top-info">
                                    <span className="bay-id">{slot.slotNumber || slot.id}</span>
                                    {isEV && <Zap size={13} className="ev-icon-spark" />}
                                  </div>

                                  <div className="bay-center-icon">
                                    {isOccupied ? (
                                      <Car size={20} className="car-occupied-icon" />
                                    ) : isChosen ? (
                                      <Check size={20} className="car-chosen-icon" />
                                    ) : (
                                      <CarFront size={20} className="car-free-icon" />
                                    )}
                                  </div>

                                  <span className="bay-status-text">
                                    {isOccupied ? "Occupied" : isChosen ? "SELECTED" : isEV ? "⚡ EV Free" : "Available"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slot Details Panel */}
                  <div className="booking-summary-sidebar">
                    <h3>Parking Bay Information</h3>

                    {selectedSlot ? (
                      <div className="booking-chosen-summary">
                        <div className="summary-item">
                          <span className="summary-lbl">Bay Number:</span>
                          <strong className="summary-val text-primary">
                            {selectedSlot.slotNumber || selectedSlot.id}
                          </strong>
                        </div>
                        <div className="summary-item">
                          <span className="summary-lbl">Bay Category:</span>
                          <strong className="summary-val">{selectedSlot.type || "Standard Parking"}</strong>
                        </div>
                        <div className="summary-item">
                          <span className="summary-lbl">Current Status:</span>
                          <strong className={`summary-val ${selectedSlot.status?.toLowerCase() === "available" ? "text-emerald" : "text-muted"}`}>
                            {selectedSlot.status?.toUpperCase() || "AVAILABLE"}
                          </strong>
                        </div>
                        <div className="summary-item">
                          <span className="summary-lbl">Floor / Level:</span>
                          <strong className="summary-val">{selectedSlot.floor || "Level 1"}</strong>
                        </div>
                        <div className="summary-item">
                          <span className="summary-lbl">Location:</span>
                          <strong className="summary-val">{selectedLocation.name}</strong>
                        </div>
                        <div className="summary-item">
                          <span className="summary-lbl">Hourly Rate:</span>
                          <strong className="summary-val">Rs. {selectedLocation.price || 150} / hr</strong>
                        </div>

                        <div className="live-pricing-summary-card mt-3">
                          <div className="price-row">
                            <span>Bay Features:</span>
                            <strong>{selectedSlot.type?.includes("EV") ? "⚡ EV Fast Charging Bay" : "✓ Monitored & Covered"}</strong>
                          </div>
                          <div className="price-row">
                            <span>Sensor Verification:</span>
                            <strong className="text-emerald">Active Real-Time Feed</strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="dash-empty-ticket-state" style={{ padding: "30px 16px" }}>
                        <CarFront size={32} className="text-muted" style={{ margin: "0 auto 10px" }} />
                        <h4 style={{ fontSize: "1rem", color: "var(--navy)" }}>Select a Bay</h4>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          Click any parking slot on the layout to view detailed bay information.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* MEMBER 2: Reservation, Availability, Payment, My Reservations & Double-booking protection */}
          <ReservationModule
            user={user}
            location={selectedLocation}
            slot={selectedSlot}
            onRefresh={loadDashboard}
          />
        </div>
      </main>
    </div>
  );
}
export { UserDashboard };
