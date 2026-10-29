import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LocationsManagementPage from "./pages/LocationsManagementPage";
import SlotsManagementPage from "./pages/SlotsManagementPage";
import ReservationsManagementPage from "./pages/ReservationsManagementPage";
import ReportsPage from "./pages/ReportsPage";
import AdminRoute from "./components/auth/AdminRoute";
import "./admin.css";

export default function AdminModule({ user, role = "admin" }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL or internal state
  const getTabFromPath = (pathname) => {
    if (pathname.includes("/locations")) return "locations";
    if (pathname.includes("/slots")) return "slots";
    if (pathname.includes("/reservations")) return "reservations";
    if (pathname.includes("/reports")) return "reports";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
  const [selectedLocationForSlots, setSelectedLocationForSlots] = useState("");

  // Keep active tab in sync if URL changes
  useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    setActiveTab(tab);
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    // If routing is supported at the app level, push URL
    if (location.pathname.startsWith("/admin")) {
      const targetPath = tabId === "dashboard" ? "/admin" : `/admin/${tabId}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }
    }
  };

  const handleNavigateToSlots = (locationId) => {
    setSelectedLocationForSlots(locationId);
    setActiveTab("slots");
  };

  // Dynamic titles for layout header
  const titles = {
    dashboard: {
      title: "Admin Dashboard",
      subtitle: "System overview, live metrics, and real-time activity",
    },
    locations: {
      title: "Locations Management",
      subtitle: "Manage parking hubs, city centers, and pricing",
    },
    slots: {
      title: "Slots Management",
      subtitle: "Configure individual or bulk parking bays and availability",
    },
    reservations: {
      title: "Reservations Management",
      subtitle: "Approve, monitor, complete, or cancel parking bookings",
    },
    reports: {
      title: "Reports & Analytics",
      subtitle: "Financial trends, peak hours, and occupancy insights",
    },
  };

  const currentMeta = titles[activeTab] || titles.dashboard;

  return (
    <AdminRoute user={user} role={role}>
      <AdminLayout
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        user={user}
        title={currentMeta.title}
        subtitle={currentMeta.subtitle}
      >
        {activeTab === "dashboard" && (
          <AdminDashboardPage onNavigateTab={handleSelectTab} />
        )}
        {activeTab === "locations" && (
          <LocationsManagementPage onNavigateToSlots={handleNavigateToSlots} />
        )}
        {activeTab === "slots" && (
          <SlotsManagementPage initialLocationId={selectedLocationForSlots} />
        )}
        {activeTab === "reservations" && (
          <ReservationsManagementPage />
        )}
        {activeTab === "reports" && (
          <ReportsPage />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}

export { AdminModule };
