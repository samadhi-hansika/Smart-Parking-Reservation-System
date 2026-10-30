import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function UnauthorizedPage({ user, role }) {
  return (
    <div className="admin-unauthorized-container">
      <div className="admin-unauthorized-card">
        <div className="unauthorized-icon-wrap">
          <ShieldAlert size={48} />
        </div>
        <h1 className="unauthorized-title">Access Restricted</h1>
        <p className="unauthorized-desc">
          You do not have administrative privileges to access the ParkLink Admin Console.
          This section is strictly restricted to system administrators with <code>role: "admin"</code>.
        </p>

        {user && (
          <div className="unauthorized-user-badge">
            <span className="user-email-label">Signed in as:</span>
            <span className="user-email-val">{user.email}</span>
            <span className="user-role-val">(Current Role: {role || "user"})</span>
          </div>
        )}

        <div className="unauthorized-actions">
          <Link to="/" className="admin-btn admin-btn-ghost">
            <ArrowLeft size={16} /> Return to Home
          </Link>
          <Link to="/user-dashboard" className="admin-btn admin-btn-primary">
            Go to Driver Dashboard
          </Link>
          {!user && (
            <Link to="/login" className="admin-btn admin-btn-outline">
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
