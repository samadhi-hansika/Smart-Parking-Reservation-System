import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminModule from "./AdminModule";
import UnauthorizedPage from "./pages/UnauthorizedPage";

/**
 * AdminRoutes provides flexible routing for App.jsx.
 * Mount at `/admin/*`.
 */
export default function AdminRoutes({ user, role }) {
  return (
    <Routes>
      <Route index element={<AdminModule user={user} role={role} />} />
      <Route path="locations" element={<AdminModule user={user} role={role} />} />
      <Route path="slots" element={<AdminModule user={user} role={role} />} />
      <Route path="reservations" element={<AdminModule user={user} role={role} />} />
      <Route path="reports" element={<AdminModule user={user} role={role} />} />
      <Route path="unauthorized" element={<UnauthorizedPage user={user} role={role} />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export { AdminRoutes };
