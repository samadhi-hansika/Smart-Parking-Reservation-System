import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  CarFront,
  CircleUserRound,
  Menu,
  X,
  ArrowRight,
  LogOut
} from "lucide-react";
import { auth } from "../../firebase";
import Btn from "../common/Btn";
import { LayoutDashboardIcon } from "../common/Icons";

export default function Navbar({ user, role }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
    navigate("/");
  };

  const scrollToSection = (id) => {
    setOpen(false);
    if (pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setOpen(false)}>
          <div className="brand-icon-box">
            <CarFront className="brand-car-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              Park<span className="brand-highlight">Link</span>
            </span>
            <span className="brand-tagline">SMART PARKING</span>
          </div>
        </Link>

        {/* Desktop Navlinks */}
        <nav className="desktop-nav">
          <Link
            to="/"
            className={`nav-item ${pathname === "/" ? "nav-active" : ""}`}
          >
            Home
          </Link>
          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("locations")}
          >
            Parking Hubs
          </button>
          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>
          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("how")}
          >
            How It Works
          </button>
          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </button>
        </nav>

        {/* Right CTA */}
        <div className="nav-actions">
          {user ? (
            <div className="user-nav-group">
              <Link
                to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
                className="btn btn-outline btn-sm dashboard-quick-btn"
              >
                <LayoutDashboardIcon />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/my-profile"
                className="user-avatar-pill"
                title="My Profile"
              >
                <CircleUserRound className="avatar-icon" />
                <span className="avatar-name">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
              </Link>
              <button
                type="button"
                className="btn-icon logout-icon-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="guest-nav-group">
              <Link to="/login" className="nav-login-btn">
                Log In
              </Link>
              <Btn
                to="/register"
                variant="primary"
                size="sm"
                className="nav-register-btn"
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Btn>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${open ? "drawer-open" : ""}`}>
        <div className="drawer-links">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className={`drawer-link ${pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <button
            type="button"
            className="drawer-link"
            onClick={() => scrollToSection("locations")}
          >
            Parking Hubs
          </button>
          <button
            type="button"
            className="drawer-link"
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>
          <button
            type="button"
            className="drawer-link"
            onClick={() => scrollToSection("how")}
          >
            How It Works
          </button>
          <button
            type="button"
            className="drawer-link"
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </button>

          <div className="drawer-divider"></div>

          {user ? (
            <div className="drawer-auth-box">
              <Link
                to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
                className="btn btn-primary full mb-2"
                onClick={() => setOpen(false)}
              >
                Go to Dashboard
              </Link>
              <Link
                to="/my-profile"
                className="btn btn-outline full mb-2"
                onClick={() => setOpen(false)}
              >
                My Profile
              </Link>
              <button
                type="button"
                className="btn btn-ghost full"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="drawer-auth-box">
              <Btn
                to="/login"
                variant="outline"
                className="full mb-2"
                onClick={() => setOpen(false)}
              >
                Log In
              </Btn>
              <Btn
                to="/register"
                variant="primary"
                className="full"
                onClick={() => setOpen(false)}
              >
                Create Account
              </Btn>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export { Navbar };
