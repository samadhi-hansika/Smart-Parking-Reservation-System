import React from "react";
import DashboardNavbar from "../components/layout/DashboardNavbar";

export default function AdminDashboard({ user }) {
  return (
    <div className="dashboard-page-wrapper">
      <DashboardNavbar user={user} admin />

      <main className="dashboard-main-content">
        <div className="container">
          <div className="dash-welcome-header">
            <div>
              <span className="welcome-badge badge-admin">ADMIN DASHBOARD</span>
              <h1>Welcome, Admin</h1>
              <p>System Administrator Control & Overview</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export { AdminDashboard };
