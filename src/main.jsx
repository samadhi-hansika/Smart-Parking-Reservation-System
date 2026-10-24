import React, { useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  runTransaction,
  deleteDoc
} from "firebase/firestore";

import {
  CarFront,
  Car,
  MapPin,
  Mail,
  CircleUserRound,
  Menu,
  X,
  ArrowRight,
  Search,
  Star,
  TrendingUp,
  Apple,
  ShieldCheck,
  Clock3,
  Leaf,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  Zap,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  QrCode,
  SlidersHorizontal,
  Navigation,
  Compass,
  HelpCircle,
  PhoneCall,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Check,
  Info,
  ChevronDown,
  Layers,
  Award
} from "lucide-react";

import { auth, db } from "./firebase";
import "./style.css";

/* =========================================================
   DEFAULT / FALLBACK DATA (For instant showcase & seeding)
========================================================= */

const DEFAULT_LOCATIONS = [
  {
    id: "loc-colombo-1",
    name: "Colombo City Centre Deck",
    address: "Sir James Pieris Mawatha, Colombo 02",
    city: "Colombo",
    totalSlots: 24,
    availableSlots: 14,
    price: 150,
    rating: 4.9,
    reviewsCount: 328,
    features: ["Covered", "EV Fast Charging", "24/7 Security", "CCTV", "Disabled Access"],
    popular: true,
    imageGradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)"
  },
  {
    id: "loc-kandy-1",
    name: "Kandy City Centre Car Park",
    address: "Dalada Veediya, Kandy Central",
    city: "Kandy",
    totalSlots: 30,
    availableSlots: 11,
    price: 120,
    rating: 4.8,
    reviewsCount: 215,
    features: ["Covered", "Valet Option", "24/7 Security", "Direct Mall Access"],
    popular: false,
    imageGradient: "linear-gradient(135deg, #065f46, #10b981)"
  },
  {
    id: "loc-galle-1",
    name: "Galle Fort Heritage Park",
    address: "Rampart Street, Galle Fort",
    city: "Galle",
    totalSlots: 18,
    availableSlots: 6,
    price: 100,
    rating: 4.7,
    reviewsCount: 184,
    features: ["Open Air", "Tourist Zone", "CCTV", "Ocean View"],
    popular: false,
    imageGradient: "linear-gradient(135deg, #7c2d12, #f97316)"
  },
  {
    id: "loc-colombo-2",
    name: "One Galle Face Premium Bays",
    address: "1A Centre Road, Colombo 01",
    city: "Colombo",
    totalSlots: 40,
    availableSlots: 21,
    price: 200,
    rating: 4.95,
    reviewsCount: 512,
    features: ["Multi-Level", "Tesla / EV Supercharger", "Valet Parking", "Car Wash Available"],
    popular: true,
    imageGradient: "linear-gradient(135deg, #4c1d95, #8b5cf6)"
  }
];

// Helper to generate slot grid for a location
function generateFallbackSlots(locationId) {
  const lanes = ["A", "B", "C"];
  const slots = [];
  let count = 0;
  lanes.forEach((lane) => {
    for (let i = 1; i <= 6; i++) {
      count++;
      const slotNumber = `${lane}-${String(i).padStart(2, "0")}`;
      const isEV = i === 1 || i === 6;
      // Some realistic occupied pattern
      const isOccupied = (count % 3 === 0) || (lane === "B" && i === 4);
      slots.push({
        id: `${locationId}-slot-${slotNumber}`,
        locationId: locationId,
        slotNumber: slotNumber,
        type: isEV ? "EV Charging" : i % 2 === 0 ? "Standard" : "Wide / SUV",
        status: isOccupied ? "occupied" : "available",
        floor: "Level 1",
        lane: lane
      });
    }
  });
  return slots;
}

/* =========================================================
   REUSABLE UI COMPONENTS
========================================================= */

function Btn({
  children,
  to,
  onClick,
  variant = "primary", // primary | secondary | outline | ghost | white | danger | success
  size = "md", // sm | md | lg
  className = "",
  disabled = false,
  type = "button"
}) {
  const Component = to ? Link : "button";
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const variantClass = `btn-${variant}`;

  return (
    <Component
      to={to}
      onClick={onClick}
      disabled={disabled}
      type={to ? undefined : type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </Component>
  );
}

function SectionHeading({ badge, title, subtitle, centered = false }) {
  return (
    <div className={`section-header ${centered ? "text-center" : ""}`}>
      {badge && (
        <div className="section-badge">
          <Sparkles className="badge-sparkle-icon" />
          <span>{badge}</span>
        </div>
      )}
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

/* =========================================================
   NAVBAR COMPONENT
========================================================= */

function Navbar({ user, role }) {
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

function LayoutDashboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  );
}

/* =========================================================
   LANDING / HOME PAGE
========================================================= */

function Home({ user, role }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [activeFaq, setActiveFaq] = useState(null);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return DEFAULT_LOCATIONS.filter((loc) => {
      const matchCity = selectedCity === "all" || loc.city.toLowerCase() === selectedCity.toLowerCase();
      const matchQuery =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchQuery;
    });
  }, [searchQuery, selectedCity]);

  const handleBookLocation = (location) => {
    if (user) {
      navigate("/user-dashboard", { state: { selectedLocationId: location.id } });
    } else {
      navigate("/login", { state: { returnTo: "/user-dashboard" } });
    }
  };

  return (
    <main className="landing-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-mesh-glow"></div>
        <div className="hero-dot-pattern"></div>

        <div className="container hero-container">
          <div className="hero-left">
            <div className="hero-live-badge">
              <span className="live-pulsing-dot"></span>
              <span className="live-text">REAL-TIME SMART PARKING NETWORK</span>
              <Sparkles size={14} className="badge-icon-right" />
            </div>

            <h1 className="hero-heading">
              Find & Explore Parking <br />
              <span className="hero-gradient-text">Smart Hubs & Slots.</span>
            </h1>

            <p className="hero-description">
              Browse premier parking locations, check real-time bay availability, and inspect monitored slots across prime city hubs.
            </p>

            <div className="hero-cta-group">
              <Btn
                onClick={() => {
                  const el = document.getElementById("locations");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                variant="primary"
                size="lg"
                className="hero-primary-btn"
              >
                <span>Explore Parking Hubs</span>
                <ArrowRight size={18} />
              </Btn>

              <button
                type="button"
                className="btn btn-secondary btn-lg hero-secondary-btn"
                onClick={() => {
                  const el = document.getElementById("how");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Trust and Social Proof */}
            <div className="hero-trust-bar">
              <div className="trust-avatars">
                <div className="avatar-chip av-1"></div>
                <div className="avatar-chip av-2"></div>
                <div className="avatar-chip av-3"></div>
                <div className="avatar-chip av-4">+</div>
              </div>
              <div className="trust-text">
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="star-filled" fill="currentColor" />
                  ))}
                  <span className="trust-rating-score">4.9/5</span>
                </div>
                <span className="trust-sub">Trusted by 25,000+ happy drivers in Sri Lanka</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="hero-stat-ribbon">
              <div className="ribbon-item">
                <strong>99.8%</strong>
                <span>Guaranteed Spot</span>
              </div>
              <div className="ribbon-divider"></div>
              <div className="ribbon-item">
                <strong>15+</strong>
                <span>Premium Hubs</span>
              </div>
              <div className="ribbon-divider"></div>
              <div className="ribbon-item">
                <strong>&lt; 30s</strong>
                <span>Live Availability</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL: 3D ANGLE LIVE PARKING DECK */}
          <div className="hero-right">
            <div className="deck-visual-wrapper">
              <div className="deck-glass-card">
                {/* Header */}
                <div className="deck-card-top">
                  <div className="deck-location-info">
                    <span className="deck-hub-badge">Colombo 02 Hub</span>
                    <h3 className="deck-hub-title">Live Sensor Deck • Level 1</h3>
                  </div>
                  <div className="deck-live-pill">
                    <span className="pulse-circle"></span>
                    <span>LIVE OCCUPANCY</span>
                  </div>
                </div>

                {/* Simulated Visual Parking Layout */}
                <div className="deck-bays-layout">
                  <div className="deck-lane-marker">LANE A</div>
                  <div className="deck-slots-grid">
                    <div className="deck-slot-item available">
                      <span className="slot-id">A-01</span>
                      <Car size={16} className="slot-car-icon" />
                      <span className="slot-badge">FREE</span>
                    </div>
                    <div className="deck-slot-item occupied">
                      <span className="slot-id">A-02</span>
                      <Car size={16} className="slot-car-icon" />
                      <span className="slot-badge">BUSY</span>
                    </div>
                    <div className="deck-slot-item occupied">
                      <span className="slot-id">A-03</span>
                      <CarFront size={16} className="slot-car-icon" />
                      <span className="slot-badge">BUSY</span>
                    </div>
                    <div className="deck-slot-item available ev-slot">
                      <span className="slot-id">A-04</span>
                      <Zap size={14} className="slot-ev-icon" />
                      <span className="slot-badge">⚡ EV</span>
                    </div>
                  </div>

                  <div className="deck-road-strip">
                    <div className="road-dash-line"></div>
                    <span className="road-direction">ONE WAY ENTRY ➔</span>
                  </div>

                  <div className="deck-lane-marker">LANE B</div>
                  <div className="deck-slots-grid">
                    <div className="deck-slot-item occupied">
                      <span className="slot-id">B-01</span>
                      <Car size={16} className="slot-car-icon" />
                      <span className="slot-badge">BUSY</span>
                    </div>
                    <div className="deck-slot-item available">
                      <span className="slot-id">B-02</span>
                      <Car size={16} className="slot-car-icon" />
                      <span className="slot-badge">FREE</span>
                    </div>
                    <div className="deck-slot-item available">
                      <span className="slot-id">B-03</span>
                      <Car size={16} className="slot-car-icon" />
                      <span className="slot-badge">FREE</span>
                    </div>
                    <div className="deck-slot-item occupied">
                      <span className="slot-id">B-04</span>
                      <Car size={16} className="slot-car-icon" />
                      <span className="slot-badge">BUSY</span>
                    </div>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="deck-card-bottom">
                  <div className="deck-legend">
                    <span className="legend-item"><span className="dot dot-free"></span> Free</span>
                    <span className="legend-item"><span className="dot dot-busy"></span> Occupied</span>
                    <span className="legend-item"><span className="dot dot-ev"></span> EV Charging</span>
                  </div>
                  <div className="deck-stats">
                    <strong>14 / 24</strong>
                    <span>Spots Available</span>
                  </div>
                </div>
              </div>

              {/* Floating Accent Cards */}
              <div className="floating-card-1 glass-floating">
                <div className="fc-icon-wrap">
                  <CheckCircle2 size={20} className="text-emerald" />
                </div>
                <div>
                  <strong>Bay A-03 Confirmed</strong>
                  <p>Navigation started • 4 mins away</p>
                </div>
              </div>

              <div className="floating-card-2 glass-floating">
                <div className="fc-icon-wrap fc-cyan">
                  <Zap size={18} className="text-cyan" />
                </div>
                <div>
                  <strong>Fast EV Charging</strong>
                  <p>120 kW Supercharger ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARKING HUBS SHOWCASE SECTION */}
      <section id="locations" className="section-padding bg-slate-soft">
        <div className="container">
          <SectionHeading
            badge="SMART HUBS"
            title="Explore Premier Parking Hubs"
            subtitle="Real-time availability, clear hourly rates, and top-tier security at high-traffic zones."
            centered
          />

          {/* Search & Filter Bar */}
          <div className="locations-filter-bar">
            <div className="filter-search-input">
              <Search size={18} className="search-prefix-icon" />
              <input
                type="text"
                placeholder="Search by location, mall name, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="city-filter-pills">
              {["all", "Colombo", "Kandy", "Galle"].map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`city-pill ${selectedCity.toLowerCase() === city.toLowerCase() ? "city-pill-active" : ""}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city === "all" ? "All Cities" : city}
                </button>
              ))}
            </div>
          </div>

          {/* Locations Grid */}
          <div className="locations-card-grid">
            {filteredLocations.map((loc) => {
              const availabilityPercent = Math.round((loc.availableSlots / loc.totalSlots) * 100);
              return (
                <article key={loc.id} className="location-card-premium">
                  {/* Card Banner */}
                  <div
                    className="location-card-banner"
                    style={{ background: loc.imageGradient }}
                  >
                    <div className="banner-top-badges">
                      <span className="city-tag">{loc.city}</span>
                      {loc.popular && <span className="popular-tag">🔥 Popular</span>}
                    </div>
                    <div className="banner-icon-circle">
                      <MapPin size={26} className="text-white" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="location-card-content">
                    <div className="loc-rating-row">
                      <div className="rating-badge">
                        <Star size={13} fill="currentColor" />
                        <span>{loc.rating}</span>
                      </div>
                      <span className="reviews-text">({loc.reviewsCount} verified reviews)</span>
                    </div>

                    <h3 className="location-name">{loc.name}</h3>
                    <p className="location-address">
                      <Navigation size={13} className="loc-pin-mini" />
                      <span>{loc.address}</span>
                    </p>

                    {/* Features Chips */}
                    <div className="feature-tags-wrap">
                      {loc.features.slice(0, 3).map((feat) => (
                        <span key={feat} className="feature-chip">
                          {feat.includes("EV") ? "⚡ " : feat.includes("Security") ? "🛡️ " : "✓ "}
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Availability Bar */}
                    <div className="loc-availability-container">
                      <div className="avail-label-row">
                        <span className="avail-title">Live Availability</span>
                        <span className="avail-numbers">
                          <strong className="text-emerald">{loc.availableSlots}</strong> / {loc.totalSlots} Slots Free
                        </span>
                      </div>
                      <div className="avail-progress-track">
                        <div
                          className="avail-progress-bar"
                          style={{
                            width: `${availabilityPercent}%`,
                            background: availabilityPercent > 30 ? "var(--emerald)" : "var(--rose)"
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="location-bottom-cta">
                      <div className="price-block">
                        <span className="price-label">Rate</span>
                        <div className="price-amount">
                          <strong>Rs. {loc.price}</strong>
                          <span className="price-unit">/ hour</span>
                        </div>
                      </div>

                      <Btn
                        variant="primary"
                        size="sm"
                        onClick={() => handleBookLocation(loc)}
                        className="book-now-btn"
                      >
                        <span>View Slots</span>
                        <ArrowRight size={14} />
                      </Btn>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredLocations.length === 0 && (
            <div className="empty-locations-state">
              <Search size={36} className="empty-search-icon" />
              <h3>No parking hubs found</h3>
              <p>We couldn't find any hubs matching "{searchQuery}". Try selecting another city or clearing your search.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm mt-3"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US / FEATURES */}
      <section id="features" className="section-padding">
        <div className="container">
          <SectionHeading
            badge="WHY CHOOSE PARKLINK"
            title="Engineered for Effortless Parking"
            subtitle="Built with real-time IoT sensors, secure cloud architecture, and intuitive design."
            centered
          />

          <div className="features-grid-modern">
            <div className="feature-box">
              <div className="f-icon-box f-icon-blue">
                <Clock3 size={24} />
              </div>
              <h3>Save Time & Stress</h3>
              <p>Skip the endless circling. Check real-time slot availability before driving to your destination.</p>
            </div>

            <div className="feature-box">
              <div className="f-icon-box f-icon-emerald">
                <ShieldCheck size={24} />
              </div>
              <h3>Verified 24/7 Security</h3>
              <p>All partner hubs feature round-the-clock CCTV surveillance, gated access, and verified security personnel.</p>
            </div>

            <div className="feature-box">
              <div className="f-icon-box f-icon-purple">
                <Zap size={24} />
              </div>
              <h3>Integrated EV Charging</h3>
              <p>Filter easily by Level 2 and DC Fast Charging bays to keep your electric vehicle charged while you park.</p>
            </div>

            <div className="feature-box">
              <div className="f-icon-box f-icon-amber">
                <Leaf size={24} />
              </div>
              <h3>Eco-Friendly Mobility</h3>
              <p>By cutting parking search time by up to 80%, ParkLink reduces urban fuel consumption and carbon footprint.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section-padding bg-slate-soft">
        <div className="container">
          <SectionHeading
            badge="SIMPLE 3-STEP FLOW"
            title="How ParkLink Works"
            subtitle="From searching to pulling into your designated bay in 3 effortless steps."
            centered
          />

          <div className="steps-container-modern">
            <div className="step-card-modern">
              <div className="step-number-tag">01</div>
              <div className="step-icon-circle">
                <MapPin size={24} />
              </div>
              <h3>Find Your Location</h3>
              <p>Search near your destination, view real-time available bays, transparent pricing, and parking amenities.</p>
            </div>

            <div className="step-card-modern">
              <div className="step-number-tag">02</div>
              <div className="step-icon-circle">
                <SlidersHorizontal size={24} />
              </div>
              <h3>Choose Bay & Time</h3>
              <p>Pick your preferred lane and bay (Standard, Wide SUV, or EV Charging) and set your arrival & departure times.</p>
            </div>

            <div className="step-card-modern">
              <div className="step-number-tag">03</div>
              <div className="step-icon-circle">
                <QrCode size={24} />
              </div>
              <h3>Drive In & Scan Pass</h3>
              <p>Receive your instant digital QR pass. Present it at the gate for seamless, hands-free entry and exit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD BANNER */}
      <section className="section-padding">
        <div className="container">
          <div className="app-download-banner">
            <div className="app-banner-glow"></div>
            <div className="app-banner-content">
              <span className="app-banner-badge">MOBILE EXPERIENCE</span>
              <h2>Park on the Go with the ParkLink App</h2>
              <p>
                Get live turn-by-turn navigation directly to your booked bay, automated gate opening, and receipt management.
              </p>
              <div className="store-buttons-row">
                <a href="#download" className="store-btn">
                  <Apple size={22} className="store-icon" />
                  <div className="store-btn-text">
                    <small>Download on the</small>
                    <strong>Apple App Store</strong>
                  </div>
                </a>
                <a href="#download" className="store-btn">
                  <PlayIcon />
                  <div className="store-btn-text">
                    <small>GET IT ON</small>
                    <strong>Google Play Store</strong>
                  </div>
                </a>
              </div>
            </div>

            <div className="app-banner-visual">
              <div className="app-phone-mockup">
                <div className="phone-screen">
                  <div className="phone-screen-header">
                    <span>ParkLink Pass</span>
                    <span className="pass-pill-active">ACTIVE</span>
                  </div>
                  <div className="phone-pass-qr">
                    <QrCode size={78} />
                  </div>
                  <div className="phone-pass-details">
                    <strong>Bay A-03 • Colombo Deck</strong>
                    <small>Valid Today • 09:00 - 11:00</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="section-padding bg-slate-soft">
        <div className="container max-w-3xl">
          <SectionHeading
            badge="QUESTIONS & ANSWERS"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about reserving and parking with ParkLink."
            centered
          />

          <div className="faq-accordion-list">
            {[
              {
                q: "How do I create a driver account on ParkLink?",
                a: "Click 'Get Started' or 'Register', enter your name, email, and password to set up your driver account in under a minute."
              },
              {
                q: "How can I view parking locations and slot layouts?",
                a: "Once logged into your Driver Dashboard, you can browse locations by city and click 'View Parking Slots' to inspect the visual 2D bay layout."
              },
              {
                q: "Are EV charging bays clearly indicated?",
                a: "Yes! EV charging bays are indicated with the ⚡ EV icon and cyan indicator on the visual parking deck layout."
              },
              {
                q: "Can I manage my profile and password securely?",
                a: "Yes, you can update your driver name and change your password securely at any time from your Profile section."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item-card ${activeFaq === idx ? "faq-open" : ""}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="faq-question-row">
                  <h4>{faq.q}</h4>
                  <ChevronDown className="faq-chevron" size={18} />
                </div>
                {activeFaq === idx && (
                  <div className="faq-answer-content">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner-box">
            <div className="cta-banner-text">
              <h2>Ready to experience effortless parking?</h2>
              <p>Join over 25,000 drivers enjoying guaranteed parking spots in prime city locations.</p>
            </div>
            <div className="cta-banner-actions">
              <Btn
                to={user ? "/user-dashboard" : "/register"}
                variant="white"
                size="lg"
              >
                <span>{user ? "Open Dashboard" : "Create Free Account"}</span>
                <ArrowRight size={16} />
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-modern">
        <div className="container footer-content">
          <div className="footer-brand-side">
            <div className="brand-logo">
              <div className="brand-icon-box">
                <CarFront className="brand-car-icon" />
              </div>
              <div className="brand-text">
                <span className="brand-title text-white">
                  Park<span className="brand-highlight">Link</span>
                </span>
                <span className="brand-tagline text-muted">SMART PARKING SYSTEM</span>
              </div>
            </div>
            <p className="footer-bio">
              Intelligent, sensor-driven parking reservation platform designed to eliminate congestion and streamline urban mobility.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#locations">Parking Hubs</a>
              <a href="#features">Smart Features</a>
              <a href="#how">How It Works</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>Cities</h4>
              <a href="#locations">Colombo Hubs</a>
              <a href="#locations">Kandy Parking</a>
              <a href="#locations">Galle Fort Bays</a>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">User Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/my-profile">My Account</Link>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>&copy; {new Date().getFullYear()} ParkLink Technologies. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms of Service</a>
            <span>•</span>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.989V2.803c0-.36.08-.7.22-.989zM15.207 13.414l2.586 2.586-13.086 7.555a2.417 2.417 0 0 1-.707.245l11.207-10.386zm0-2.828L4 0.201c.23.05.47.13.707.245l13.086 7.554-2.586 2.586zm1.414 1.414l3.782 2.183c1.077.622 1.077 1.636 0 2.258l-3.782 2.183V12z"/>
    </svg>
  );
}

/* =========================================================
   DASHBOARD NAVBAR
========================================================= */

function DashboardNavbar({ user, admin = false }) {
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

/* =========================================================
   USER DASHBOARD (Member 1: User & Authentication, Locations, Slots)
========================================================= */

function UserDashboard({ user }) {
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
      const loadedSlots = slotsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

      setProfile({
        name: savedProfile.name || user.displayName || user.email?.split("@")[0] || "Driver",
        email: savedProfile.email || user.email || ""
      });

      if (loadedLocations.length > 0) {
        setLocations(loadedLocations);
        setSlots(loadedSlots);
      } else {
        setLocations(DEFAULT_LOCATIONS);
        const fallbackSlots = DEFAULT_LOCATIONS.flatMap((loc) => generateFallbackSlots(loc.id));
        setSlots(fallbackSlots);
      }
    } catch (loadError) {
      console.error("Unable to load user dashboard:", loadError);
      setLocations(DEFAULT_LOCATIONS);
      const fallbackSlots = DEFAULT_LOCATIONS.flatMap((loc) => generateFallbackSlots(loc.id));
      setSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.uid]);

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
    return generateFallbackSlots(selectedLocation.id);
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
                      const displaySlots = laneSlots.length > 0 ? laneSlots : currentSlots.slice(0, 6);

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

                  {/* Slot Details Panel (No Reservation Action) */}
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
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   USER PROFILE
========================================================= */

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        const profileData = profileSnapshot.exists() ? profileSnapshot.data() : {};
        if (!cancelled) {
          setName(profileData.name || user.displayName || user.email?.split("@")[0] || "");
          setEmail(profileData.email || user.email || "");
        }
      } catch (loadError) {
        console.error("Profile load error:", loadError);
        if (!cancelled) {
          setName(user.displayName || user.email?.split("@")[0] || "");
          setEmail(user.email || "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await setDoc(doc(db, "users", user.uid), { name: cleanName }, { merge: true });
      setName(cleanName);
      setNotice("Profile name successfully updated.");
    } catch (saveError) {
      console.error("Save profile error:", saveError);
      setError("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice("Password updated successfully.");
    } catch (err) {
      console.error("Password update error:", err);
      if (["auth/wrong-password", "auth/invalid-credential"].includes(err.code)) {
        setPasswordError("Current password is incorrect.");
      } else {
        setPasswordError(err.message || "Could not update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard-page-wrapper">
      <DashboardNavbar user={user} />

      <main className="dashboard-main-content">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="profile-header-banner">
            <div className="profile-avatar-circle">
              <span className="profile-initials">
                {name ? name.slice(0, 2).toUpperCase() : "U"}
              </span>
            </div>
            <div className="profile-banner-info">
              <h1>{name || "Driver Profile"}</h1>
              <p>{email}</p>
              <span className="profile-badge-pill">Verified ParkLink Driver</span>
            </div>
          </div>

          {/* Feedback messages */}
          {error && <div className="alert-box alert-error mb-4">{error}</div>}
          {notice && <div className="alert-box alert-success mb-4">{notice}</div>}

          {/* Personal Info Form */}
          <div className="settings-card-modern">
            <div className="settings-card-title">
              <UserRound size={20} className="text-primary" />
              <h3>Personal Details</h3>
            </div>
            <p className="settings-card-sub">Update your account name and contact information.</p>

            <form onSubmit={saveProfile} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <UserRound size={17} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon input-disabled">
                  <Mail size={17} />
                  <input type="email" value={email} readOnly disabled />
                </div>
                <small className="field-hint">Email address cannot be changed.</small>
              </div>

              <Btn
                type="submit"
                variant="primary"
                disabled={loading || saving}
                className="mt-2"
              >
                {saving ? "Saving Changes…" : "Save Changes"}
              </Btn>
            </form>
          </div>

          {/* Security & Password */}
          <div className="settings-card-modern mt-4">
            <div className="settings-card-title">
              <LockKeyhole size={20} className="text-primary" />
              <h3>Security & Password</h3>
            </div>
            <p className="settings-card-sub">Ensure your account is protected with a strong password.</p>

            {passwordError && <div className="alert-box alert-error mb-3">{passwordError}</div>}
            {passwordNotice && <div className="alert-box alert-success mb-3">{passwordNotice}</div>}

            <form onSubmit={changePassword} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="input-with-icon">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-with-icon">
                    <LockKeyhole size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-with-icon">
                    <LockKeyhole size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>

              <Btn
                type="submit"
                variant="primary"
                disabled={saving}
                className="mt-2"
              >
                {saving ? "Updating Password…" : "Update Password"}
              </Btn>
            </form>
          </div>

          {/* Sign Out Card */}
          <div className="settings-card-modern mt-4 signout-card">
            <div>
              <h3>Sign Out of Session</h3>
              <p>Log out of your ParkLink account on this device.</p>
            </div>
            <Btn variant="outline" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </Btn>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ user }) {
  return (
    <div className="dashboard-page-wrapper">
      <DashboardNavbar user={user} admin />

      <main className="dashboard-main-content">
        <div className="container">
          <div className="dash-welcome-header">
            <div>
              <span className="welcome-badge badge-admin">ADMIN DASHBOARD</span>
              <h1>Welcome, Admin</h1>
              <p>Admin panel</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   AUTH PAGES (LOGIN / REGISTER)
========================================================= */

function Auth({ register = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (register) {
        const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, "users", result.user.uid), {
          name: form.name,
          email: form.email,
          role: "user",
          createdAt: serverTimestamp()
        });

        await signOut(auth);
        navigate("/login", {
          replace: true,
          state: { registered: true }
        });
      } else {
        const result = await signInWithEmailAndPassword(auth, form.email, form.password);
        const profile = await getDoc(doc(db, "users", result.user.uid));
        const role = profile.exists() ? profile.data().role : "user";
        navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address already has an account. Please log in.");
      } else if (err.code === "auth/weak-password") {
        setError("Please choose a password with at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-mesh-bg"></div>

      <div className="auth-card-modern">
        {/* Brand */}
        <Link to="/" className="auth-brand-logo">
          <div className="brand-icon-box">
            <CarFront className="brand-car-icon" />
          </div>
          <span className="brand-title">
            Park<span className="brand-highlight">Link</span>
          </span>
        </Link>

        {/* Tab switch */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${!register ? "active" : ""}`}
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${register ? "active" : ""}`}
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </div>

        <div className="auth-card-header">
          <h1>{register ? "Join ParkLink" : "Welcome Back"}</h1>
          <p>
            {register
              ? "Create your driver account to explore parking hubs and slot availability."
              : "Sign in to access your dashboard and explore parking locations."}
          </p>
        </div>

        {location.state?.registered && !register && (
          <div className="alert-box alert-success mb-3">
            <CheckCircle2 size={16} />
            <span>Account created successfully. Please log in.</span>
          </div>
        )}

        {error && (
          <div className="alert-box alert-error mb-3">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          {register && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <UserRound size={17} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={17} />
              <input
                type="email"
                required
                placeholder="driver@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <LockKeyhole size={17} />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Btn
            type="submit"
            variant="primary"
            size="lg"
            className="full mt-3"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <RefreshCw className="spin-icon" size={16} />
                <span>Processing…</span>
              </>
            ) : (
              <span>{register ? "Create Free Account" : "Log In to Account"}</span>
            )}
          </Btn>
        </form>

        <div className="auth-footer-links">
          <Link to="/" className="auth-back-link">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ROLE ROUTE GUARD
========================================================= */

function RoleRoute({ user, role, requiredRole, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }
  return children;
}

/* =========================================================
   APP MAIN ENTRY
========================================================= */

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      try {
        if (currentUser) {
          const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
          setRole(profileSnap.exists() ? profileSnap.data().role || "user" : "user");
        } else {
          setRole("");
        }
      } catch (err) {
        console.error("Auth state role fetch error:", err);
        setRole("user");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const isDashboardRoute = pathname.includes("-dashboard") || pathname === "/my-profile";

  if (loading) {
    return (
      <div className="app-global-loader">
        <div className="loader-box">
          <div className="brand-icon-box loader-spin">
            <CarFront size={28} />
          </div>
          <h3>Loading ParkLink</h3>
          <p>Connecting to smart parking network…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Display public navbar only on landing & informational pages */}
      {!isDashboardRoute && !pathname.startsWith("/login") && !pathname.startsWith("/register") && (
        <Navbar user={user} role={role} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />
            ) : (
              <Home user={user} role={role} />
            )
          }
        />

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />

        <Route
          path="/user-dashboard"
          element={
            <RoleRoute user={user} role={role} requiredRole="user">
              <UserDashboard user={user} />
            </RoleRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <RoleRoute user={user} role={role} requiredRole="user">
              <UserProfile user={user} />
            </RoleRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <RoleRoute user={user} role={role} requiredRole="admin">
              <AdminDashboard user={user} />
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

/* =========================================================
   MOUNT TO ROOT
========================================================= */

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
