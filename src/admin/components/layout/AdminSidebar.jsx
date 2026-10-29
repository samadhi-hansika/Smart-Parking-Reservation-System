import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  MapPin,
  Layers,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  LogOut,
  CarFront,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { auth } from "../../../firebase";

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  user,
  onSeedData,
  isSeeding = false,
  isOpen = false,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
    },
    {
      id: "locations",
      label: "Locations",
      icon: MapPin,
      path: "/admin/locations",
    },
    {
      id: "slots",
      label: "Slots Management",
      icon: Layers,
      path: "/admin/slots",
    },
    {
      id: "reservations",
      label: "Reservations",
      icon: CalendarCheck,
      path: "/admin/reservations",
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      path: "/admin/reports",
    },
  ];

  const handleItemClick = (item) => {
    if (onSelectTab) {
      onSelectTab(item.id);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Sidebar Brand Header */}
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand-link">
            <div className="admin-brand-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="admin-brand-text">
              <span className="brand-title">
                Park<span className="brand-accent">Link</span>
              </span>
              <span className="brand-badge-admin">ADMIN CONSOLE</span>
            </div>
          </Link>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="admin-sidebar-nav">
          <span className="admin-nav-category">CORE MANAGEMENT</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="admin-nav-icon">
                  <Icon size={18} />
                </span>
                <span className="admin-nav-label">{item.label}</span>
                {isActive && <span className="admin-nav-active-pill" />}
              </button>
            );
          })}

          <span className="admin-nav-category mt-4">SYSTEM TOOLS</span>
          <button
            type="button"
            className="admin-nav-item admin-nav-seed"
            onClick={onSeedData}
            disabled={isSeeding}
            title="Populate test locations, slots, and bookings"
          >
            <span className="admin-nav-icon text-amber">
              <Sparkles size={18} className={isSeeding ? "spin-animate" : ""} />
            </span>
            <span className="admin-nav-label">
              {isSeeding ? "Seeding Firestore..." : "Seed Sample Data"}
            </span>
          </button>

          <Link to="/user-dashboard" className="admin-nav-item">
            <span className="admin-nav-icon">
              <CarFront size={18} />
            </span>
            <span className="admin-nav-label">Driver Portal</span>
            <ExternalLink size={13} className="ml-auto opacity-50" />
          </Link>
        </nav>

        {/* Sidebar Footer User Info & Sign Out */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile-card">
            <div className="admin-avatar">
              {(user?.displayName || user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">
                {user?.displayName || user?.email?.split("@")[0] || "Administrator"}
              </span>
              <span className="admin-user-role-badge">SUPER ADMIN</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Sign Out of Admin Console"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
