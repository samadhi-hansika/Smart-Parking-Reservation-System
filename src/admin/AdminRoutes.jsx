import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminModule from "./AdminModule";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AdminRoute from "./components/auth/AdminRoute";

/**
 * AdminRoutes provides flexible routing for App.jsx.
 * Can be mounted at `/admin/*` or `/admin-dashboard`.
 */
export default function AdminRoutes({ user, role }) {
  return (
    <Routes>
      <Route path="/" element={<AdminModule user={user} role={role} />} />
      <Route path="/locations" element={<AdminModule user={user} role={role} />} />
      <Route path="/slots" element={<AdminModule user={user} role={role} />} />
      <Route path="/reservations" element={<AdminModule user={user} role={role} />} />
      <Route path="/reports" element={<AdminModule user={user} role={role} />} />
      <Route path="/unauthorized" element={<UnauthorizedPage user={user} role={role} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}

export { AdminRoutes };
