import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
  useParams
} from "react-router-dom";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where
} from "firebase/firestore";

import {
  CarFront,
  MapPin,
  Info,
  Settings,
  Mail,
  CircleUserRound,
  Menu,
  X,
  ArrowRight,
  Search,
  Play,
  ShieldCheck,
  Clock3,
  Leaf,
  Building2,
  CalendarCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ChevronLeft,
  Trash2,
  Plus
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

function Navbar({ user, role }) {
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
                <span className="avatars">● ● ●</span>
                <span><b>★★★★★</b><br />Join 50k+ happy drivers</span>
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

                      <small>${(12 - index * 2) / 10}.00 · Available</small>

                    </div>

                    <ArrowRight />

                  </div>

                ))}

              </div>

            </div>

            <div className="availability-card">
              <small>Slots Available</small>
              <strong>12,482</strong>
              <span>↑ 12% this week</span>
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
              safer and more efficient for everyone — from
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
          <div className="store-buttons"><button> &nbsp; App Store</button><button>▶ &nbsp; Google Play</button></div>
        </div>
        <div className="phone-pair"><div>⌖<br /><small>Find a Parking</small></div><div>⌖<br /><small>Reserve a Spot</small></div></div>
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
            to={user ? "/locations" : "/register"}
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
            © 2026 Smart Parking Reservation System.
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

        navigate("/dashboard");

      } else {

        const result =
          await signInWithEmailAndPassword(
            auth,
            form.email,
            form.password
          );

        const userDocument =
          await getDoc(
            doc(db, "users", result.user.uid)
          );

        if (
          userDocument.exists() &&
          userDocument.data().role === "admin"
        ) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }

    } catch (error) {

      console.error(error);

      setError(
        "Invalid details. Please check your information and try again."
      );

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
            placeholder="••••••••"
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
          ← Back to home
        </Link>

      </form>

    </div>
  );
}

/* LOCATIONS */

function Locations() {

  const [locations, setLocations] = useState([]);

  const [search, setSearch] = useState("");

  useEffect(() => {

    const loadLocations = async () => {

      try {

        const snapshot =
          await getDocs(
            collection(db, "locations")
          );

        setLocations(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );

      } catch (error) {

        console.error(error);

      }

    };

    loadLocations();

  }, []);

  const filteredLocations =
    locations.filter((location) =>
      `${location.name} ${location.address}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (

    <Page
      title="Find Your Parking Location"
      label="PARKING LOCATIONS"
      text="Choose a location and view its available parking slots."
    >

      <div className="search">

        <Search />

        <input
          placeholder="Search by location name or address..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

      </div>

      <div className="locGrid">

        {filteredLocations.map((location) => (

          <Link
            className="locCard"
            to={`/slots/${location.id}`}
            key={location.id}
          >

            <div className="locCover">
              <MapPin />
            </div>

            <div className="locBody">

              <h3>
                {location.name}
              </h3>

              <p>
                {location.address ||
                  "Address not available"}
              </p>

              <b>

                {location.availableSlots || 0}
                {" "}available slots

                <ArrowRight />

              </b>

            </div>

          </Link>

        ))}

        {!filteredLocations.length && (
          <Empty>
            No parking locations found.
          </Empty>
        )}

      </div>

    </Page>
  );
}

/*  PARKING SLOTS */

function Slots() {

  const { id } = useParams();

  const [location, setLocation] = useState(null);

  const [slots, setSlots] = useState([]);

  useEffect(() => {

    const loadData = async () => {

      try {

        const [locationSnapshot, slotsSnapshot] =
          await Promise.all([

            getDoc(
              doc(db, "locations", id)
            ),

            getDocs(
              query(
                collection(db, "slots"),
                where("locationId", "==", id)
              )
            )

          ]);

        if (locationSnapshot.exists()) {

          setLocation({
            id: locationSnapshot.id,
            ...locationSnapshot.data()
          });

        }

        setSlots(
          slotsSnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );

      } catch (error) {

        console.error(error);

      }

    };

    loadData();

  }, [id]);

  return (

    <Page
      back="/locations"
      title={location?.name || "Parking Slots"}
      label="AVAILABLE PARKING"
      text={
        location?.address ||
        "Select an available parking slot."
      }
    >

      <div className="slotGrid">

        {slots.map((slot) => {

          const available =
            slot.status !== "inactive" &&
            slot.status !== "maintenance";

          return (

            <div
              className={`slot ${
                available ? "" : "disabled"
              }`}
              key={slot.id}
            >

              <strong>
                {slot.slotNumber}
              </strong>

              <div>

                <h3>
                  Parking Slot {slot.slotNumber}
                </h3>

                <p>
                  {slot.type || "Standard"}
                  {" • "}
                  LKR {slot.price || 0}/hour
                </p>

              </div>

              <span>
                {available
                  ? "Available"
                  : "Unavailable"}
              </span>

              {available && (

                <Link
                  className="btn primary small"
                  to={`/reserve/${id}/${slot.id}`}
                >
                  Reserve
                </Link>

              )}

            </div>
          );
        })}

        {!slots.length && (
          <Empty>
            No slots have been added yet.
          </Empty>
        )}

      </div>

    </Page>
  );
}

/*  RESERVATION*/

function Reserve() {

  const { id, slotId } = useParams();

  const navigate = useNavigate();

  const [location, setLocation] = useState(null);

  const [slot, setSlot] = useState(null);

  const [form, setForm] = useState({
    date: "",
    start: "08:00",
    end: "09:00"
  });

  useEffect(() => {

    const loadData = async () => {

      try {

        const [locationSnapshot, slotSnapshot] =
          await Promise.all([

            getDoc(
              doc(db, "locations", id)
            ),

            getDoc(
              doc(db, "slots", slotId)
            )

          ]);

        if (locationSnapshot.exists()) {

          setLocation(
            locationSnapshot.data()
          );

        }

        if (slotSnapshot.exists()) {

          setSlot({
            id: slotSnapshot.id,
            ...slotSnapshot.data()
          });

        }

      } catch (error) {

        console.error(error);

      }

    };

    loadData();

  }, [id, slotId]);

  const handleSubmit = (event) => {

    event.preventDefault();

    if (form.end <= form.start) {

      alert(
        "End time must be after start time."
      );

      return;
    }

    const reservation = {

      locationId: id,

      slotId,

      locationName:
        location?.name || "",

      slotNumber:
        slot?.slotNumber || "",

      date:
        form.date,

      startTime:
        form.start,

      endTime:
        form.end,

      price:
        slot?.price || 0
    };

    sessionStorage.setItem(
      "pendingReservation",
      JSON.stringify(reservation)
    );

    navigate("/reservations");
  };

  return (

    <Page
      back={`/slots/${id}`}
      title="Make a Reservation"
      label="RESERVATION"
      text={`${location?.name || ""} • Slot ${
        slot?.slotNumber || ""
      }`}
    >

      <form
        className="reserveCard"
        onSubmit={handleSubmit}
      >

        <label>
          Date

          <input
            type="date"
            required
            min={
              new Date()
                .toISOString()
                .slice(0, 10)
            }
            value={form.date}
            onChange={(event) =>
              setForm({
                ...form,
                date: event.target.value
              })
            }
          />

        </label>

        <div className="two">

          <label>
            Start Time

            <input
              type="time"
              value={form.start}
              onChange={(event) =>
                setForm({
                  ...form,
                  start: event.target.value
                })
              }
            />

          </label>

          <label>
            End Time

            <input
              type="time"
              value={form.end}
              onChange={(event) =>
                setForm({
                  ...form,
                  end: event.target.value
                })
              }
            />

          </label>

        </div>

        <div className="summary">

          Estimated fee

          <b>
            LKR {slot?.price || 0} / hour
          </b>

        </div>

        <Btn className="full">
          Continue Reservation
        </Btn>

      </form>

    </Page>
  );
}

/* my reservations */

function Reservations() {

  const [reservations, setReservations] =
    useState([]);

  const [pending, setPending] =
    useState(null);

  const loadReservations = async () => {

    if (!auth.currentUser) {
      return;
    }

    try {

      const snapshot =
        await getDocs(
          query(
            collection(db, "reservations"),
            where(
              "userId",
              "==",
              auth.currentUser.uid
            )
          )
        );

      setReservations(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }))
      );

    } catch (error) {

      console.error(error);

    }
  };

  useEffect(() => {

    loadReservations();

    const pendingData =
      sessionStorage.getItem(
        "pendingReservation"
      );

    if (pendingData) {

      setPending(
        JSON.parse(pendingData)
      );

    }

  }, []);

  const confirmReservation = async () => {

    if (!pending || !auth.currentUser) {
      return;
    }

    try {

      await addDoc(
        collection(db, "reservations"),
        {
          ...pending,

          userId:
            auth.currentUser.uid,

          status: "confirmed",

          paymentStatus: "mock_paid",

          createdAt:
            serverTimestamp()
        }
      );

      sessionStorage.removeItem(
        "pendingReservation"
      );

      setPending(null);

      await loadReservations();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to confirm reservation."
      );

    }
  };

  const cancelReservation = async (id) => {

    const confirmCancel =
      window.confirm(
        "Are you sure you want to cancel this reservation?"
      );

    if (!confirmCancel) {
      return;
    }

    try {

      await updateDoc(
        doc(db, "reservations", id),
        {
          status: "cancelled"
        }
      );

      await loadReservations();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to cancel reservation."
      );

    }
  };

  return (

    <Page
      title="My Reservations"
      label="MY BOOKINGS"
      text="View and manage your parking reservations."
    >

      {pending && (

        <div className="pending">

          <div>

            <b>
              Reservation ready to confirm
            </b>

            <p>
              {pending.locationName}
              {" • "}
              Slot {pending.slotNumber}
              {" • "}
              {pending.date}
              {" • "}
              {pending.startTime}
              {" – "}
              {pending.endTime}
            </p>

          </div>

          <Btn onClick={confirmReservation}>
            Confirm Reservation
          </Btn>

        </div>

      )}

      <div className="resList">

        {reservations.map((reservation) => (

          <div
            className="resRow"
            key={reservation.id}
          >

            <div className="round">
              <CarFront />
            </div>

            <div className="grow">

              <b>
                {reservation.locationName ||
                  "Parking Location"}
              </b>

              <p>
                Slot {reservation.slotNumber || "—"}
              </p>

            </div>

            <div>

              <b>
                {reservation.date}
              </b>

              <small>
                {reservation.startTime}
                {" – "}
                {reservation.endTime}
              </small>

            </div>

            <span className="status">
              {reservation.status}
            </span>

            {reservation.status ===
              "confirmed" && (

              <button
                className="delete"
                onClick={() =>
                  cancelReservation(
                    reservation.id
                  )
                }
              >
                <Trash2 />
              </button>

            )}

          </div>

        ))}

        {!reservations.length &&
          !pending && (

            <Empty>
              No reservations yet.
            </Empty>

          )}

      </div>

    </Page>
  );
}

/* user dashboard */

function Dashboard() {

  return (

    <Page
      title="Welcome to Smart Parking"
      label="USER DASHBOARD"
      text="Find a space, reserve it, and park without the stress."
    >

      <div className="quick">

        <Link to="/locations">

          <MapPin />

          Find Parking Locations

          <ArrowRight />

        </Link>

        <Link to="/reservations">

          <CalendarCheck />

          My Reservations

          <ArrowRight />

        </Link>

      </div>

    </Page>
  );
}

/* admin dashboard */

function Admin() {

  const [counts, setCounts] =
    useState({
      locations: 0,
      slots: 0,
      reservations: 0,
      users: 0
    });

  useEffect(() => {

    const loadCounts = async () => {

      try {

        const [
          locations,
          slots,
          reservations,
          users
        ] = await Promise.all([

          getDocs(
            collection(db, "locations")
          ),

          getDocs(
            collection(db, "slots")
          ),

          getDocs(
            collection(db, "reservations")
          ),

          getDocs(
            collection(db, "users")
          )

        ]);

        setCounts({

          locations: locations.size,

          slots: slots.size,

          reservations:
            reservations.size,

          users: users.size

        });

      } catch (error) {

        console.error(error);

      }

    };

    loadCounts();

  }, []);

  return (

    <Page
      title="Parking Management Dashboard"
      label="ADMINISTRATION"
      text="Manage locations, parking slots and reservations."
    >

      <div className="stats">

        <Stat
          v={counts.locations}
          t="Locations"
          i={<MapPin />}
        />

        <Stat
          v={counts.slots}
          t="Parking Slots"
          i={<CarFront />}
        />

        <Stat
          v={counts.reservations}
          t="Reservations"
          i={<CalendarCheck />}
        />

        <Stat
          v={counts.users}
          t="Registered Users"
          i={<CircleUserRound />}
        />

      </div>

      <div className="adminLinks">

        <Link to="/admin/locations">

          <MapPin />

          Manage Locations

          <ArrowRight />

        </Link>

        <Link to="/admin/slots">

          <CarFront />

          Manage Parking Slots

          <ArrowRight />

        </Link>

        <Link to="/admin/reservations">

          <CalendarCheck />

          Manage Reservations

          <ArrowRight />

        </Link>

      </div>

    </Page>
  );
}

/* admin management */

function Manage({ type }) {

  const [items, setItems] =
    useState([]);

  const [locations, setLocations] =
    useState([]);

  const [form, setForm] =
    useState({});

  const loadData = async () => {

    try {

      const snapshot =
        await getDocs(
          collection(db, type)
        );

      setItems(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }))
      );

      if (type === "slots") {

        const locationSnapshot =
          await getDocs(
            collection(db, "locations")
          );

        setLocations(
          locationSnapshot.docs.map(
            (item) => ({
              id: item.id,
              ...item.data()
            })
          )
        );

      }

    } catch (error) {

      console.error(error);

    }
  };

  useEffect(() => {

    loadData();

  }, [type]);

  const handleAdd = async (event) => {

    event.preventDefault();

    try {

      if (type === "locations") {

        await addDoc(
          collection(db, "locations"),
          {
            name: form.name,
            address: form.address,
            availableSlots:
              Number(form.availableSlots || 0),
            createdAt:
              serverTimestamp()
          }
        );

      } else if (type === "slots") {

        await addDoc(
          collection(db, "slots"),
          {
            locationId:
              form.locationId,

            slotNumber:
              form.slotNumber,

            type:
              form.type || "Standard",

            price:
              Number(form.price || 0),

            status:
              "available",

            createdAt:
              serverTimestamp()
          }
        );

      }

      setForm({});

      await loadData();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to add this item."
      );

    }
  };

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this item?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteDoc(
        doc(db, type, id)
      );

      await loadData();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to delete this item."
      );

    }
  };

  const title =
    type === "locations"
      ? "Manage Locations"
      : type === "slots"
      ? "Manage Parking Slots"
      : "Manage Reservations";

  return (

    <Page
      title={title}
      label="ADMIN"
      text="Maintain system data."
    >

      <div className="manage">

        {type !== "reservations" && (

          <form
            className="formbox"
            onSubmit={handleAdd}
          >

            {type === "locations" && (
              <>

                <label>

                  Name

                  <input
                    required
                    value={form.name || ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value
                      })
                    }
                  />

                </label>

                <label>

                  Address

                  <input
                    required
                    value={form.address || ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        address:
                          event.target.value
                      })
                    }
                  />

                </label>

                <label>

                  Available Slots

                  <input
                    type="number"
                    min="0"
                    value={
                      form.availableSlots || 0
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        availableSlots:
                          event.target.value
                      })
                    }
                  />

                </label>

              </>
            )}

            {type === "slots" && (
              <>

                <label>

                  Location

                  <select
                    required
                    value={
                      form.locationId || ""
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        locationId:
                          event.target.value
                      })
                    }
                  >

                    <option value="">
                      Select Location
                    </option>

                    {locations.map(
                      (location) => (

                        <option
                          key={location.id}
                          value={location.id}
                        >
                          {location.name}
                        </option>

                      )
                    )}

                  </select>

                </label>

                <label>

                  Slot Number

                  <input
                    required
                    placeholder="A01"
                    value={
                      form.slotNumber || ""
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        slotNumber:
                          event.target.value
                      })
                    }
                  />

                </label>

                <label>

                  Slot Type

                  <select
                    value={
                      form.type ||
                      "Standard"
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type:
                          event.target.value
                      })
                    }
                  >

                    <option>
                      Standard
                    </option>

                    <option>
                      VIP
                    </option>

                    <option>
                      Disabled
                    </option>

                    <option>
                      EV Charging
                    </option>

                  </select>

                </label>

                <label>

                  Price per Hour

                  <input
                    type="number"
                    min="0"
                    value={
                      form.price || 0
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price:
                          event.target.value
                      })
                    }
                  />

                </label>

              </>
            )}

            <Btn>
              <Plus />
              Add
            </Btn>

          </form>

        )}

        <div className="manageList">

          {items.map((item) => (

            <div
              className="manageRow"
              key={item.id}
            >

              <div className="round">
                {type === "locations"
                  ? <MapPin />
                  : type === "slots"
                  ? <CarFront />
                  : <CalendarCheck />}
              </div>

              <div className="grow">

                <b>

                  {type === "locations"
                    ? item.name
                    : type === "slots"
                    ? `Slot ${item.slotNumber}`
                    : item.locationName ||
                      "Reservation"}

                </b>

                <p>

                  {type === "locations"
                    ? item.address
                    : type === "slots"
                    ? `${item.type || "Standard"} • LKR ${
                        item.price || 0
                      }/hour`
                    : `${item.date || ""} ${
                        item.startTime || ""
                      } – ${
                        item.endTime || ""
                      }`}

                </p>

              </div>

              <button
                className="delete"
                onClick={() =>
                  handleDelete(item.id)
                }
              >
                <Trash2 />
              </button>

            </div>

          ))}

          {!items.length && (

            <Empty>
              No records found.
            </Empty>

          )}

        </div>

      </div>

    </Page>
  );
}

/* stat component*/

function Stat({ v, t, i }) {

  return (

    <div className="stat">

      <div>
        {i}
      </div>

      <strong>
        {v}
      </strong>

      <span>
        {t}
      </span>

    </div>
  );
}

/* page layout*/

function Page({
  title,
  label,
  text,
  children,
  back
}) {

  return (

    <main className="app">

      <div className="container">

        {back && (

          <Link
            className="backLink"
            to={back}
          >
            <ChevronLeft />
            Back
          </Link>

        )}

        <div className="pageTitle">

          <div>

            <div className="label">
              {label}
            </div>

            <h1>
              {title}
            </h1>

            <p>
              {text}
            </p>

          </div>

        </div>

        {children}

      </div>

    </main>
  );
}

/* empty */

function Empty({ children }) {

  return (
    <div className="empty">
      {children}
    </div>
  );
}

/* protected route */

function Protected({
  user,
  role,
  admin = false,
  children
}) {

  if (!user) {

    return (
      <Navigate to="/login" />
    );
  }

  if (
    admin &&
    role !== "admin"
  ) {

    return (
      <Navigate to="/dashboard" />
    );
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

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          try {

            setUser(currentUser);

            if (currentUser) {

              const userSnapshot =
                await getDoc(
                  doc(
                    db,
                    "users",
                    currentUser.uid
                  )
                );

              if (
                userSnapshot.exists()
              ) {

                setRole(
                  userSnapshot.data().role ||
                  "user"
                );

              } else {

                setRole("user");

              }

            } else {

              setRole("");

            }

          } catch (error) {

            console.error(error);

            setRole("");

          } finally {

            setLoading(false);

          }

        }
      );

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
      <Navbar
        user={user}
        role={role}
      />

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/"
          element={
            <Home user={user} />
          }
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

        {/* USER */}

        <Route
          path="/dashboard"
          element={
            <Protected
              user={user}
              role={role}
            >
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/locations"
          element={
            <Protected
              user={user}
              role={role}
            >
              <Locations />
            </Protected>
          }
        />

        <Route
          path="/slots/:id"
          element={
            <Protected
              user={user}
              role={role}
            >
              <Slots />
            </Protected>
          }
        />

        <Route
          path="/reserve/:id/:slotId"
          element={
            <Protected
              user={user}
              role={role}
            >
              <Reserve />
            </Protected>
          }
        />

        <Route
          path="/reservations"
          element={
            <Protected
              user={user}
              role={role}
            >
              <Reservations />
            </Protected>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <Protected
              user={user}
              role={role}
              admin
            >
              <Admin />
            </Protected>
          }
        />

        <Route
          path="/admin/locations"
          element={
            <Protected
              user={user}
              role={role}
              admin
            >
              <Manage type="locations" />
            </Protected>
          }
        />

        <Route
          path="/admin/slots"
          element={
            <Protected
              user={user}
              role={role}
              admin
            >
              <Manage type="slots" />
            </Protected>
          }
        />

        <Route
          path="/admin/reservations"
          element={
            <Protected
              user={user}
              role={role}
              admin
            >
              <Manage type="reservations" />
            </Protected>
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
