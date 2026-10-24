import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CarFront } from "lucide-react";

import { auth, db } from "./firebase";
import Navbar from "./components/layout/Navbar";
import RoleRoute from "./components/auth/RoleRoute";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
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
export { App };