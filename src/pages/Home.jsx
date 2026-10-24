import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Star,
  CarFront,
  Car,
  Zap,
  CheckCircle2,
  MapPin,
  Navigation,
  Search,
  X,
  Clock3,
  ShieldCheck,
  Leaf,
  SlidersHorizontal,
  QrCode,
  Apple,
  ChevronDown,
  ArrowRight
} from "lucide-react";

import { DEFAULT_LOCATIONS } from "../data/parkingData";
import Btn from "../components/common/Btn";
import SectionHeading from "../components/common/SectionHeading";
import { PlayIcon } from "../components/common/Icons";

export default function Home({ user, role }) {
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
export { Home };
