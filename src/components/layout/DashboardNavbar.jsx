import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  ShieldCheck,
  CarFront,
  CircleUserRound,
  LogOut
} from "lucide-react";
import { auth } from "../../firebase";

export default function DashboardNavbar({ user, admin = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className="dashboard-header-bar">
      <div className="container dash-header-inner">
        {/* Brand */}
        <Link
          to="/"
          className="brand-logo"
        >
          <div className="brand-icon-box">
            {admin ? <ShieldCheck className="brand-car-icon" /> : <CarFront className="brand-car-icon" />}
          </div>
          <div className="brand-text">
            <span className="brand-title">
              Park<span className="brand-highlight">Link</span>
            </span>
            <span className="brand-tagline">
              {admin ? "ADMIN CONTROL" : "USER DASHBOARD"}
            </span>
          </div>
        </Link>

        {/* Dashboard Navigation Tabs */}
        {!admin && (
          <nav className="dashboard-nav-tabs">
            <Link
              to="/user-dashboard"
              className={`dash-tab ${pathname === "/user-dashboard" ? "active" : ""}`}
            >
              Dashboard
            </Link>
            <a href="#locations-section" className="dash-tab">
              Parking Hubs
            </a>
            <Link
              to="/my-profile"
              className={`dash-tab ${pathname === "/my-profile" ? "active" : ""}`}
            >
              Profile & Security
            </Link>
          </nav>
        )}

        {/* Right Info & Actions */}
        <div className="dashboard-header-right">
          <Link to="/my-profile" className="dash-user-badge">
            <div className="dash-user-avatar">
              <CircleUserRound size={18} />
            </div>
            <div className="dash-user-info">
              <span className="dash-user-name">
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </span>
              <span className="dash-user-role">
                {admin ? "Administrator" : "Standard Driver"}
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="btn btn-outline btn-sm dash-logout-btn"
            onClick={handleLogout}
            title="Log Out"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
export { DashboardNavbar };
