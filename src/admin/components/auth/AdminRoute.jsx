import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { ShieldCheck } from "lucide-react";

export default function AdminRoute({ children, user: propUser, role: propRole }) {
  const [currentUser, setCurrentUser] = useState(propUser ?? auth.currentUser);
  const [userRole, setUserRole] = useState(propRole ?? "");
  const [checking, setChecking] = useState(!propRole);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminRole() {
      const activeUser = auth.currentUser;
      if (!activeUser) {
        if (isMounted) {
          setCurrentUser(null);
          setUserRole("");
          setChecking(false);
        }
        return;
      }

      setCurrentUser(activeUser);

      // If propRole is already provided and matches, use it
      if (propRole) {
        setUserRole(propRole);
        setChecking(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", activeUser.uid));
        if (isMounted) {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role || "user");
          } else {
            setUserRole("user");
          }
        }
      } catch (err) {
        console.error("AdminRoute role check error:", err);
        if (isMounted) setUserRole("user");
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    verifyAdminRole();

    return () => {
      isMounted = false;
    };
  }, [propRole]);

  if (checking) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-card">
          <div className="admin-loading-spin">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <h3>Verifying Admin Permissions</h3>
          <p>Authenticating administrative credentials from Firestore...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
}
