import React, { useEffect, useState } from "react";
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
  runTransaction
} from "firebase/firestore";

import {
  CarFront,
  MapPin,
  Mail,
  CircleUserRound,
  Menu,
  X,
  ArrowRight,
  Search,
  Play,
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
  UserRound
} from "lucide-react";

import { auth, db } from "./firebase";

import "./style.css";

/* button component */

function Btn({
  children,
  to,
  onClick,
  outline = false,
  white = false,
  className = ""
}) {
  const Component = to ? Link : "button";

  return (
    <Component
      to={to}
      onClick={onClick}
      className={`btn ${
        outline ? "outline" : white ? "white" : "primary"
      } ${className}`}
    >
      {children}
    </Component>
  );
}

/* navbar */

function Navbar({ user }) {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="nav">

        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>
          <span className="brandIcon">
            <CarFront />
          </span>

          <span>
            <b className="brandName"><span className="brandNamePark">Park</span><span className="brandNameLink">Link</span></b>
          </span>
        </a>

        <button
          className="menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? "navlinks open" : "navlinks"}>

          <a
            href="/"
            onClick={() => setOpen(false)}
            className={pathname === "/" ? "active" : ""}
          >
            Home
          </a>

          <a href="#about" onClick={() => setOpen(false)}>Locations</a>

          <a href="#about" onClick={() => setOpen(false)}>About</a>

          <a href="#download" onClick={() => setOpen(false)}>How It Works</a>

          {user ? (
            <>
              <button className="profile-link" type="button">
                <CircleUserRound />
              </button>

              <button
                className="btn outline navbtn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button className={`login-link ${pathname === "/login" ? "active" : ""}`} type="button" onClick={() => { setOpen(false); navigate("/login"); }}>Login</button>

              <button
                className={`btn primary navbtn ${pathname === "/register" ? "auth-current" : ""}`}
                type="button"
                onClick={() => { setOpen(false); navigate("/register"); }}
              >
                Register
              </button>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}

/* home page */

function Home({ user }) {
  return (
    <main>

      {/* HERO */}

      <section className="hero">

        <div className="heroGlow"></div>

        <div className="container heroGrid">

          <div className="heroText">

            <div className="eyebrow">
              FASTEST BOOKING IN THE CITY
            </div>

            <h1>
              Find. Reserve.
              <br />
              <span>Park. Made Easy.</span>
            </h1>

            <p>
              Skip the circling and the stress. Reserve your spot in
              seconds with our smart network of premium parking
              locations. Simple, secure, and always ready for you.
            </p>

            <div className="actions">

              <Btn>
                Book Now <ArrowRight />
              </Btn>

              <a
                className="btn outline"
                href="#how"
              >
                Learn More
              </a>

            </div>

            <div className="trust">

              <span>
                <span className="avatars" aria-hidden="true"><i /><i /><i /></span>
                <span className="driver-rating"><b aria-label="Rated five out of five">{[1, 2, 3, 4, 5].map((star) => <Star key={star} />)}</b><br />Join 50k+ happy drivers</span>
              </span>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="visual">

            <div className="phone">

              <div className="notch"></div>
 
              <div className="phonebody">

                <small>Current Location</small>
                <b>Downtown, NY</b>

                <div className="psearch">
                  <Search />
                  Search location...
                </div>

                {[
                  "Central Plaza P1",
                  "Underground X",
                  "Riverfront Lot"
                ].map((location, index) => (

                  <div
                    className="ploc"
                    key={location}
                  >

                    <span>P</span>

                    <div>

                      <b>{location}</b>

                      <small>${(12 - index * 2) / 10}.00 &middot; Available</small>

                    </div>

                    <ArrowRight />

                  </div>

                ))}

              </div>

            </div>

            <div className="availability-card">
              <small>Slots Available</small>
              <strong>12,482</strong>
              <span><TrendingUp aria-hidden="true" /> 12% this week</span>
            </div>

          </div>

        </div>

      </section>

      {/* ABOUT */}

      <section
        id="about"
        className="section"
      >

        <div className="container benefitGrid">

          <div>

            <div className="label">
              WHY CHOOSE OUR SYSTEM?
            </div>

            <h2>
              The Smarter Way to Park
            </h2>

            <p>
              Our system is designed to make parking easier,
              safer and more efficient for everyone, from
              everyday drivers to parking administrators.
            </p>

          </div>

          <div className="benefits">

            <Benefit
              icon={<Clock3 />}
              t="Save Time"
              d="Never spend another minute looking for an available spot. Book ahead and drive straight to your spot."
            />

            <Benefit
              icon={<ShieldCheck />}
              t="More Secure"
              d="Rest assured, your vehicle with full transparency and no surprise charges for your peace of mind."
            />

            <Benefit
              icon={<Leaf />}
              t="Reduce Traffic"
              d="By optimizing parking searches, we help reduce city congestion and carbon emissions."
            />

            <Benefit
              icon={<Building2 />}
              t="Better Management"
              d="Real-time analytics and dynamic pricing help lot owners maximize occupancy and revenue."
            />

          </div>

        </div>

      </section>

      <section id="download" className="app-promo">
        <div>
          <h2>Ready to transform your<br />parking experience?</h2>
          <p>Download our mobile app today and get 20% off your first reservation. Available on iOS and Android.</p>
          <div className="store-buttons"><button><Apple aria-hidden="true" /> App Store</button><button><Play aria-hidden="true" /> Google Play</button></div>
        </div>
        <div className="phone-pair"><div><MapPin aria-hidden="true" /><br /><small>Find Parking</small></div><div><CarFront aria-hidden="true" /><br /><small>Reserve a Spot</small></div></div>
      </section>

      {/* HOW IT WORKS */}

      <section
        id="how"
        className="section light"
      >

        <div className="container">

          <div className="center">

            <div className="label">
              HOW IT WORKS
            </div>

            <h2>
              Park in
              <span> 3 Simple Steps</span>
            </h2>

            <p>
              Everything you need for a smoother parking
              experience.
            </p>

          </div>

          <div className="steps">

            <Step
              n="01"
              i={<MapPin />}
              t="Find a Location"
              d="Browse locations and check available parking slots."
            />

            <Step
              n="02"
              i={<Search />}
              t="Choose Your Slot"
              d="Select a free space and choose your date and time."
            />

            <Step
              n="03"
              i={<ShieldCheck />}
              t="Reserve & Park"
              d="Confirm your reservation and arrive knowing your space is ready."
            />

          </div>

        </div>

      </section>

      {/* CALL TO ACTION */}

      <section
        id="contact"
        className="cta"
      >

        <div className="container ctaBox">

          <div>

            <small>
              READY TO PARK SMARTER?
            </small>

            <h2>
              Find your parking space today.
            </h2>

            <p>
              Stop wasting time searching for a free parking spot.
            </p>

          </div>

          <Btn
            to={user ? "/#about" : "/register"}
            white
          >
            Get Started
            <ArrowRight />
          </Btn>

        </div>

      </section>

      {/* FOOTER */}

      <footer>

        <div className="container foot">

          <div className="brand">

            <span className="brandIcon">
              <MapPin />
            </span>

            <span>
              <b>Smart Parking</b>
              <small>Reservation System</small>
            </span>

          </div>

          <p>
            &copy; 2026 Smart Parking Reservation System.
          </p>

        </div>

      </footer>

    </main>
  );
}

/* benefit */

function Benefit({ icon, t, d }) {
  return (
    <div className="benefit">

      <div>
        {icon}
      </div>

      <h3>{t}</h3>

      <p>{d}</p>

    </div>
  );
}

/* step*/

function Step({ n, i, t, d }) {
  return (
    <div className="step">

      <b>{n}</b>

      <div>
        {i}
      </div>

      <h3>{t}</h3>

      <p>{d}</p>

    </div>
  );
}

/* login / register*/

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

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");

    try {

      if (register) {

        const result =
          await createUserWithEmailAndPassword(
            auth,
            form.email,
            form.password
          );

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            name: form.name,
            email: form.email,
            role: "user",
            createdAt: serverTimestamp()
          }
        );

        await signOut(auth);
        navigate("/login", {
          replace: true,
          state: { registered: true }
        });

      } else {

        const result = await signInWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

        const profile = await getDoc(doc(db, "users", result.user.uid));
        const role = profile.exists() ? profile.data().role : "user";
        navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      }

    } catch (error) {

      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email already has an account. Please log in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Choose a password with at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else if (error.code === "permission-denied" || error.code === "firestore/permission-denied") {
        setError("Your account was created, but its profile could not be saved. Please contact the administrator.");
      } else {
        setError(error.message || "Unable to complete registration. Please try again.");
      }

    }
  };

  return (

    <div className="auth">

      <form
        className="authCard"
        onSubmit={handleSubmit}
      >

        <div className="authLogo">
          <CarFront />
        </div>

        <h1>
          {register
            ? "Create Account"
            : "Welcome Back"}
        </h1>

        <p>
          {register
            ? "Join Smart Parking and reserve your space easily."
            : "Login to manage your smart parking reservations."}
        </p>

        {location.state?.registered && !register && (
          <div className="success" role="status">
            Account created successfully. Please log in.
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {register && (
          <>
            <label>
              Full Name
            </label>

            <div className="input">

              <UserRound />

              <input
                required
                value={form.name}
                placeholder="Your name"
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value
                  })
                }
              />

            </div>
          </>
        )}

        <label>
          Email Address
        </label>

        <div className="input">

          <Mail />

          <input
            required
            type="email"
            value={form.email}
            placeholder="you@example.com"
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value
              })
            }
          />

        </div>

        <label>
          Password
        </label>

        <div className="input">

          <LockKeyhole />

          <input
            required
            minLength="6"
            type={showPassword ? "text" : "password"}
            value={form.password}
            placeholder="Enter your password"
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value
              })
            }
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword
              ? <EyeOff />
              : <Eye />}
          </button>

        </div>

        <Btn className="full">
          {register
            ? "Create Account"
            : "Login"}
        </Btn>

        <p className="authBottom">

          {register
            ? "Already have an account?"
            : "Don't have an account?"}

          {" "}

          <Link
            to={
              register
                ? "/login"
                : "/register"
            }
          >
            {register
              ? "Login"
              : "Create one"}
          </Link>

        </p>

        <Link
          className="back"
          to="/"
        >
          Back to home
        </Link>

      </form>

    </div>
  );
}

function DashboardNavbar({ user, admin = false }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className="header dashboard-header">
      <div className="nav">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate(admin ? "/admin-dashboard" : "/user-dashboard"); }}>
          <span className="brandIcon">{admin ? <ShieldCheck /> : <CarFront />}</span>
          <b className="brandName"><span className="brandNamePark">Park</span><span className="brandNameLink">Link</span></b>
        </a>
        <nav className="dashboard-links" aria-label="Dashboard navigation">
          {admin ? (
            <>
              <a href="#find-parking">Find Parking</a>
              <a href="#parking-locations">Parking Locations</a>
              <a href="#available-slots">Available Slots</a>
              <a href="#my-reservations">My Reservations</a>
              <a href="#profile">Profile</a>
            </>
          ) : (
            <>
              <a href="/user-dashboard#dashboard-home">Home</a>
              <a href="/user-dashboard#find-parking">Find Parking</a>
              <a href="/user-dashboard#reservations">Reservations</a>
              <a href="/my-profile">My Profile</a>
            </>
          )}
        </nav>
        <div className="dashboard-nav-right">
          {admin && <span className="dashboard-role">ADMIN DASHBOARD</span>}
        </div>
      </div>
    </header>
  );
}

function UserDashboard({ user }) {
  const [profile, setProfile] = useState({ name: "", email: user?.email || "" });
  const [locations, setLocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [saving, setSaving] = useState(false);

  const loadDashboard = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError("");
    try {
      const [profileSnapshot, locationsSnapshot, slotsSnapshot, reservationsSnapshot] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDocs(collection(db, "locations")),
        getDocs(collection(db, "slots")),
        getDocs(query(collection(db, "reservations"), where("userId", "==", user.uid)))
      ]);
      const savedProfile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      const loadedLocations = locationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const loadedSlots = slotsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const loadedReservations = reservationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setProfile({ name: savedProfile.name || user.displayName || user.email?.split("@")[0] || "", email: savedProfile.email || user.email || "" });
      setProfileName(savedProfile.name || user.displayName || user.email?.split("@")[0] || "");
      setLocations(loadedLocations);
      setSlots(loadedSlots);
      setReservations(loadedReservations.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
    } catch (loadError) {
      console.error("Unable to load user dashboard:", loadError);
      setError("Could not load dashboard data. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [user?.uid]);

  const availableSlots = slots.filter((slot) =>
    slot.locationId === selectedLocation?.id && slot.status?.toLowerCase() === "available"
  );
  const availableCount = slots.length
    ? slots.filter((slot) => slot.status?.toLowerCase() === "available").length
    : locations.reduce((total, location) => total + (Number(location.availableSlots) || 0), 0);
  const activeReservations = reservations.filter((reservation) =>
    ["active", "confirmed"].includes(reservation.status?.toLowerCase())
  );

  const bookSlot = async (event) => {
    event.preventDefault();
    if (!selectedLocation || !selectedSlot || endTime <= startTime) {
      setError("Choose an available slot and a valid time range.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const slotRef = doc(db, "slots", selectedSlot);
      const reservationRef = doc(collection(db, "reservations"));
      const slot = slots.find((item) => item.id === selectedSlot);
      await runTransaction(db, async (transaction) => {
        const slotSnapshot = await transaction.get(slotRef);
        if (!slotSnapshot.exists() || slotSnapshot.data().status?.toLowerCase() !== "available") {
          throw new Error("That parking slot has just been reserved. Please choose another one.");
        }
        transaction.update(slotRef, { status: "reserved", reservedBy: user.uid, reservationId: reservationRef.id });
        transaction.set(reservationRef, {
          userId: user.uid,
          locationId: selectedLocation.id,
          slotId: selectedSlot,
          locationName: selectedLocation.name || "Parking location",
          slotNumber: slot?.slotNumber || slot?.number || selectedSlot,
          date,
          startTime,
          endTime,
          status: "confirmed",
          createdAt: serverTimestamp()
        });
      });
      setSelectedLocation(null);
      setSelectedSlot("");
      setNotice("Your parking reservation is confirmed.");
      await loadDashboard();
    } catch (bookingError) {
      console.error("Unable to reserve parking:", bookingError);
      setError(bookingError.message || "Could not complete the reservation.");
    } finally {
      setSaving(false);
    }
  };

  const cancelReservation = async (reservation) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setError("");
    try {
      const reservationRef = doc(db, "reservations", reservation.id);
      const slotRef = doc(db, "slots", reservation.slotId);
      await runTransaction(db, async (transaction) => {
        const [reservationSnapshot, slotSnapshot] = await Promise.all([
          transaction.get(reservationRef), transaction.get(slotRef)
        ]);
        if (!reservationSnapshot.exists()) return;
        if (slotSnapshot.exists() && slotSnapshot.data().reservationId === reservation.id) {
          transaction.update(slotRef, { status: "available", reservedBy: null, reservationId: null });
        }
        transaction.update(reservationRef, { status: "cancelled" });
      });
      setNotice("Reservation cancelled.");
      await loadDashboard();
    } catch (cancelError) {
      console.error("Unable to cancel reservation:", cancelError);
      setError("Could not cancel this reservation. Please try again.");
    }
  };

  return (
    <>
      <DashboardNavbar user={user} />
      <main className="dashboard-page user-dashboard-page">
        <div className="container user-dashboard-content">
          <section className="dashboard-welcome" id="dashboard-home">
            <span className="label">YOUR PARKLINK DASHBOARD</span>
            <h1>Welcome back, {profile.name || "..."}! <span aria-hidden="true">{"\uD83D\uDC4B"}</span></h1>
            <p>Find and reserve your perfect parking space.</p>
          </section>
          {error && <div className="dashboard-message dashboard-error" role="alert">{error}</div>}
          {notice && <div className="dashboard-message dashboard-success" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
          <section className="dashboard-stats" aria-label="Parking summary">
            <article className="dashboard-stat-card"><span className="dashboard-stat-icon"><CarFront /></span><span className="dashboard-stat-label">Available Parking</span><strong>{loading ? "…" : availableCount}</strong></article>
            <article className="dashboard-stat-card"><span className="dashboard-stat-icon"><Clock3 /></span><span className="dashboard-stat-label">My Reservations</span><strong>{loading ? "…" : reservations.length}</strong></article>
            <article className="dashboard-stat-card"><span className="dashboard-stat-icon"><ShieldCheck /></span><span className="dashboard-stat-label">Active Reservation</span><strong>{loading ? "…" : activeReservations.length}</strong></article>
          </section>

          <section className="user-dashboard-section" id="find-parking">
            <div className="dashboard-section-heading"><div><span className="label">PARKING</span><h2>Find Parking</h2></div><span>{locations.length} locations</span></div>
            {loading ? <p className="dashboard-empty">Loading parking locations…</p> : locations.length === 0 ? <p className="dashboard-empty">No parking locations are available yet.</p> :
              <div className="user-location-grid">{locations.map((location) => {
                const locationSlots = slots.filter((slot) => slot.locationId === location.id);
                const freeSlots = locationSlots.filter((slot) => slot.status?.toLowerCase() === "available");
                const reportedFreeSlots = locationSlots.length ? freeSlots.length : Number(location.availableSlots) || 0;
                return <article className="user-location-card" key={location.id}>
                  <div className="location-card-icon"><MapPin /></div>
                  <h3>{location.name || "Parking location"}</h3>
                  <p>{location.address || "Address not provided"}</p>
                  <div className="location-card-meta"><span>{reportedFreeSlots} slots available</span>{location.price != null && <span>Rs. {location.price}/hour</span>}</div>
                  <button className="btn primary" type="button" disabled={!freeSlots.length} onClick={() => { setSelectedLocation(location); setSelectedSlot(""); setError(""); document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" }); }}>
                    {freeSlots.length ? "Choose a Slot" : reportedFreeSlots ? "Slots not configured" : "Full"}
                  </button>
                </article>;
              })}</div>}
            {selectedLocation && <form className="dashboard-booking" id="booking-form" onSubmit={bookSlot}>
              <div className="dashboard-section-heading"><div><span className="label">RESERVE</span><h2>{selectedLocation.name}</h2></div><button type="button" className="dashboard-text-button" onClick={() => setSelectedLocation(null)}>Close</button></div>
              <label>Available slot<select required value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}><option value="">Select a slot</option>{availableSlots.map((slot) => <option value={slot.id} key={slot.id}>{slot.slotNumber || slot.number || slot.id}{slot.type ? ` · ${slot.type}` : ""}</option>)}</select></label>
              <div className="dashboard-booking-fields"><label>Date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Start time<input type="time" required value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>End time<input type="time" required value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></div>
              <button className="btn primary" type="submit" disabled={saving || !selectedSlot}>{saving ? "Reserving…" : "Confirm Reservation"}</button>
            </form>}
          </section>

          <section className="user-dashboard-section" id="reservations">
            <div className="dashboard-section-heading"><div><span className="label">YOUR BOOKINGS</span><h2>Reservations</h2></div><span>{reservations.length} total</span></div>
            {loading ? <p className="dashboard-empty">Loading reservations…</p> : reservations.length === 0 ? <div className="dashboard-empty dashboard-empty-card"><h3>No reservations yet</h3><p>Choose a parking location to reserve your first slot.</p><a className="btn primary" href="#find-parking">Find Parking</a></div> :
              <div className="user-reservation-list">{reservations.map((reservation) => <article className="user-reservation-card" key={reservation.id}>
                <span className="dashboard-stat-icon"><CarFront /></span><div className="user-reservation-details"><h3>{reservation.locationName || "Parking reservation"}</h3><p>Slot {reservation.slotNumber || reservation.slotId || "—"} · {reservation.date || "Date not set"} · {reservation.startTime || ""}{reservation.endTime ? `–${reservation.endTime}` : ""}</p></div>
                <span className={`reservation-status ${reservation.status?.toLowerCase() || "pending"}`}>{reservation.status || "pending"}</span>
                {reservation.status?.toLowerCase() === "confirmed" && <button className="dashboard-text-button cancel-reservation" type="button" onClick={() => cancelReservation(reservation)}>Cancel</button>}
              </article>)}</div>}
          </section>

        </div>
      </main>
    </>
  );
}

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

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
        console.error("Unable to load profile:", loadError);
        if (!cancelled) setError("Could not load your profile. Please refresh and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [user]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const updatedName = name.trim();
    if (!updatedName) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await setDoc(doc(db, "users", user.uid), { name: updatedName }, { merge: true });
      setName(updatedName);
      setNotice("Profile updated successfully.");
    } catch (saveError) {
      console.error("Unable to update profile:", saveError);
      setError("Could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");
    if (newPassword.length < 6) {
      setPasswordError("Choose a password with at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
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
      setPasswordNotice("Password changed successfully.");
    } catch (passwordChangeError) {
      console.error("Unable to change password:", passwordChangeError);
      if (["auth/wrong-password", "auth/invalid-credential"].includes(passwordChangeError.code)) {
        setPasswordError("Current password is incorrect.");
      } else if (passwordChangeError.code === "auth/weak-password") {
        setPasswordError("Choose a stronger password with at least 6 characters.");
      } else {
        setPasswordError("Could not change your password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <DashboardNavbar user={user} />
      <main className="dashboard-page user-dashboard-page user-profile-page">
        <div className="container">
          <section className="dashboard-welcome">
            <span className="label">ACCOUNT</span>
            <h1>My Profile</h1>
            <p>View and update your account details.</p>
          </section>
          {error && <div className="dashboard-message dashboard-error" role="alert">{error}</div>}
          {notice && <div className="dashboard-message dashboard-success" role="status">{notice}</div>}
          <form className="dashboard-profile-card" onSubmit={saveProfile}>
            <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} disabled={loading} /></label>
            <label>Email address<input type="email" value={email} readOnly /></label>
            <button className="btn primary" type="submit" disabled={loading || saving}>{loading ? "Loading…" : saving ? "Saving…" : "Save Profile"}</button>
          </form>
          <section className="password-change-card">
            <h2>Change Password</h2>
            <p>Enter your current password, then choose a new password.</p>
            {passwordError && <div className="dashboard-message dashboard-error" role="alert">{passwordError}</div>}
            {passwordNotice && <div className="dashboard-message dashboard-success" role="status">{passwordNotice}</div>}
            <form className="password-change-form" onSubmit={changePassword}>
              <label>Current password<input type="password" autoComplete="current-password" required minLength={6} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
              <label>New password<input type="password" autoComplete="new-password" required minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
              <label>Confirm new password<input type="password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
              <button className="btn primary" type="submit" disabled={saving}>{saving ? "Updating…" : "Change Password"}</button>
            </form>
          </section>
          <section className="profile-logout-card">
            <div><h2>Sign out</h2><p>Log out of your ParkLink account on this device.</p></div>
            <button className="btn outline" type="button" onClick={handleLogout}>Logout</button>
          </section>
        </div>
      </main>
    </>
  );
}

function AdminDashboard({ user }) {
  return (
    <>
      <DashboardNavbar user={user} admin />
      <main className="dashboard-page">
        <div className="container">
          <span className="label">ADMIN DASHBOARD</span>
          <h1>Welcome, Admin</h1>
        </div>
      </main>
    </>
  );
}

function RoleRoute({ user, role, requiredRole, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }
  return children;
}

/*main app*/

function App() {

  const [user, setUser] =
    useState(null);

  const [role, setRole] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const { pathname } = useLocation();

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(auth, async (currentUser) => {
        setLoading(true);
        setUser(currentUser);

        try {
          if (currentUser) {
            const profile = await getDoc(doc(db, "users", currentUser.uid));
            setRole(profile.exists() ? profile.data().role || "user" : "user");
          } else {
            setRole("");
          }
        } catch (error) {
          console.error(error);
          setRole("user");
        } finally {
          setLoading(false);
        }
      });

    return unsubscribe;

  }, []);

  if (loading) {

    return (
      <div className="loading">
        Loading Smart Parking...
      </div>
    );
  }

  return (

    <>
      {!pathname.endsWith("-dashboard") && pathname !== "/my-profile" && <Navbar user={user} />}

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/"
          element={user
            ? <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />
            : <Home user={user} />}
        />

        <Route
          path="/login"
          element={
            <Auth />
          }
        />

        <Route
          path="/register"
          element={
            <Auth register />
          }
        />

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

        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate to="/" />
          }
        />

      </Routes>
    </>
  );
}

/* render*/

createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>

      <App />

    </BrowserRouter>

  </React.StrictMode>
);
