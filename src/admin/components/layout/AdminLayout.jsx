import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { ToastProvider, useToast } from "../../hooks/useToast";
import { seedParkingSystemData } from "../../services/seedService";
import {
  Menu,
  Sparkles,
  Wifi,
  ShieldCheck,
  RefreshCw,
  Bell,
  CheckCircle2,
} from "lucide-react";

function AdminLayoutInner({
  children,
  activeTab,
  onSelectTab,
  user,
  title = "ParkLink Administration",
  subtitle = "Central Smart Parking Control Center",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { addToast } = useToast();

  const handleSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    addToast("Seeding realistic parking locations, slots, and bookings...", "info");

    try {
      const res = await seedParkingSystemData(user);
      addToast(
        `Successfully seeded ${res.locationsCount} locations, ${res.slotsCount} bays, and ${res.reservationsCount} reservations!`,
        "success",
        5000
      );
    } catch (err) {
      console.error("Seed error:", err);
      addToast(`Seeding failed: ${err.message || "Unknown error"}`, "error");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="admin-app-layout">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        user={user}
        onSeedData={handleSeed}
        isSeeding={isSeeding}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="admin-topbar-title">{title}</h1>
              <p className="admin-topbar-subtitle">{subtitle}</p>
            </div>
          </div>

          <div className="admin-topbar-right">
            {/* Live Status indicator */}
            <div className="admin-live-pulse-badge" title="Connected to Cloud Firestore in real time">
              <span className="live-pulse-dot"></span>
              <span className="live-status-text">Firestore Live</span>
            </div>

            {/* Quick Seed Action Button */}
            <button
              type="button"
              className="admin-btn admin-btn-seed-header"
              onClick={handleSeed}
              disabled={isSeeding}
              title="Populate test data for locations, slots, and bookings"
            >
              <Sparkles size={16} className={isSeeding ? "spin-animate" : ""} />
              <span className="hide-on-mobile">{isSeeding ? "Seeding..." : "Seed Data"}</span>
            </button>

            {/* Admin Avatar Pill */}
            <div className="admin-header-user-pill">
              <div className="header-avatar">
                {(user?.displayName || user?.email || "A").charAt(0).toUpperCase()}
              </div>
              <span className="header-user-name hide-on-mobile">
                {user?.displayName || user?.email?.split("@")[0] || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="admin-page-content">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout(props) {
  return (
    <ToastProvider>
      <AdminLayoutInner {...props} />
    </ToastProvider>
  );
}
