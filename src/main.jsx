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
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
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
        <div className="dashboard-nav-right">
          <span className="dashboard-role">{admin ? "ADMIN DASHBOARD" : "USER DASHBOARD"}</span>
          {user?.email && <span className="dashboard-email">{user.email}</span>}
          <button className="btn outline navbtn" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}

function UserDashboard({ user }) {
  return (
    <>
      <DashboardNavbar user={user} />
      <main className="dashboard-page">
        <div className="container">
          <span className="label">USER DASHBOARD</span>
          <h1>Welcome to ParkLink</h1>
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
      {!pathname.endsWith("-dashboard") && <Navbar user={user} />}

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
