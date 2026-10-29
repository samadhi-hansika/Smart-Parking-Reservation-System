import { useState, useEffect } from "react";
import { subscribeDashboardStats } from "../services/adminService";

export function useAdminLiveStats() {
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalSlots: 0,
    availableSlots: 0,
    reservedSlots: 0,
    maintenanceSlots: 0,
    activeReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    totalReservations: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentReservations: [],
    locations: [],
    slots: [],
    reservations: [],
    users: [],
    loading: true,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeDashboardStats(
      (data) => {
        setStats(data);
        setError(null);
      },
      (err) => {
        console.error("Dashboard live stats error:", err);
        setError(err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { ...stats, error };
}
