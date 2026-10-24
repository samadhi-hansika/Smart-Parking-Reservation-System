import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  CarFront,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

import { auth, db } from "../firebase";
import Btn from "../components/common/Btn";

export default function Auth({ register = false }) {
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
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found"
      ) {
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
export { Auth };
