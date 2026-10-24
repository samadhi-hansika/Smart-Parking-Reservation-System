import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ user, role, requiredRole, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }
  return children;
}
export { RoleRoute };
