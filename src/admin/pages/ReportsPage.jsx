import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import StatCard from "../components/common/StatCard";
import { useAdminLiveStats } from "../hooks/useAdminLiveStats";
import { useToast } from "../hooks/useToast";
import { exportToCsv } from "../utils/exportCsv";
import {
  formatCurrency,
  formatDate,
  formatTime12,
  formatDuration,
  getReservationAmount,
} from "../utils/formatters";
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ReportsPage() {
  const { reservations, locations, loading } = useAdminLiveStats();
  const { addToast } = useToast();

  // Period filter: today, 7d, 30d, month, all
  const [period, setPeriod] = useState("30d");

  // Filter reservations based on selected period
  const filteredReservations = useMemo(() => {
    if (!reservations || reservations.length === 0) return [];
    if (period === "all") return reservations;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return reservations.filter((r) => {
      if (!r.date) return false;
      const resDate = new Date(`${r.date}T00:00:00`);

      if (period === "today") {
        return r.date === todayStr;
      }
      if (period === "7d") {
        const diffDays = (now.getTime() - resDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === "30d") {
        const diffDays = (now.getTime() - resDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (period === "month") {
        return (
          resDate.getMonth() === now.getMonth() &&
          resDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [reservations, period]);

  // Aggregate Metrics for period
  const metrics = useMemo(() => {
    let revenue = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let activeCount = 0;

    filteredReservations.forEach((r) => {
      const st = (r.status || "").toLowerCase();
      const amt = getReservationAmount(r);

      if (st !== "cancelled") {
        revenue += amt;
      }
      if (st === "completed") completedCount++;
      else if (st === "cancelled") cancelledCount++;
      else if (st === "confirmed" || st === "active") activeCount++;
    });

    const total = filteredReservations.length;
    const avgBooking = total > 0 ? Math.round(revenue / total) : 0;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      revenue,
      completedCount,
      cancelledCount,
      activeCount,
      avgBooking,
      completionRate,
    };
  }, [filteredReservations]);

  // 1. Revenue & Bookings Trend Timeline
  const trendData = useMemo(() => {
    const map = {};

    filteredReservations.forEach((r) => {
      const dateKey = r.date || "Unknown";
      if (!map[dateKey]) {
        map[dateKey] = { date: dateKey, revenue: 0, bookings: 0 };
      }
      map[dateKey].bookings += 1;
      if ((r.status || "").toLowerCase() !== "cancelled") {
        map[dateKey].revenue += getReservationAmount(r);
      }
    });

    const list = Object.values(map);
    list.sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [filteredReservations]);

  // 2. Most-Used Locations
  const locationRankData = useMemo(() => {
    const map = {};

    // Initialize all locations
    locations.forEach((loc) => {
      map[loc.id] = {
        name: loc.name.length > 18 ? `${loc.name.slice(0, 16)}...` : loc.name,
        fullName: loc.name,
        city: loc.city,
        bookings: 0,
        revenue: 0,
      };
    });

    filteredReservations.forEach((r) => {
      const locId = r.locationId;
      if (!map[locId]) {
        map[locId] = {
          name: r.locationName || "Other",
          fullName: r.locationName || "Other",
          city: "Sri Lanka",
          bookings: 0,
          revenue: 0,
        };
      }
      map[locId].bookings += 1;
      if ((r.status || "").toLowerCase() !== "cancelled") {
        map[locId].revenue += getReservationAmount(r);
      }
    });

    return Object.values(map).sort((a, b) => b.bookings - a.bookings);
  }, [locations, filteredReservations]);

  // 3. Peak Hours Distribution (00:00 to 23:00)
  const peakHoursData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      bookings: 0,
    }));

    filteredReservations.forEach((r) => {
      if (r.startTime) {
        const h = parseInt(r.startTime.split(":")[0], 10);
        if (!isNaN(h) && h >= 0 && h < 24) {
          hours[h].bookings += 1;
        }
      }
    });

    // Only show hours from 06:00 to 22:00 for optimal chart focus if night hours are 0
    return hours.slice(6, 23);
  }, [filteredReservations]);

  // 4. Status Breakdown Pie Chart
  const statusPieData = useMemo(() => {
    const counts = {
      completed: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    };

    filteredReservations.forEach((r) => {
      const st = (r.status || "confirmed").toLowerCase();
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts.confirmed += 1;
      }
    });

    return [
      { name: "Completed", value: counts.completed, color: "#10b981" },
      { name: "Confirmed / Active", value: counts.confirmed, color: "#2563eb" },
      { name: "Pending", value: counts.pending, color: "#f59e0b" },
      { name: "Cancelled", value: counts.cancelled, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [filteredReservations]);

  // Export to CSV Handlers
  const handleExportReservationsCsv = () => {
    if (filteredReservations.length === 0) {
      addToast("No reservations in selected timeframe to export.", "warning");
      return;
    }

    const columns = [
      { key: "id", label: "Reservation ID" },
      { key: "paymentReference", label: "Reference Code" },
      { key: "userName", label: "Customer Name" },
      { key: "userEmail", label: "Customer Email" },
      { key: "locationName", label: "Parking Hub" },
      { key: "slotNumber", label: "Bay Number" },
      { key: "slotType", label: "Vehicle Type" },
      { key: "date", label: "Date" },
      { key: "startTime", label: "Start Time" },
      { key: "endTime", label: "End Time" },
      { key: "durationHours", label: "Duration (hrs)" },
      {
        key: "amount",
        label: "Amount (Rs.)",
        formatter: (val, row) => getReservationAmount(row),
      },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "paymentStatus", label: "Payment Status" },
      { key: "status", label: "Booking Status" },
      { key: "createdAt", label: "Created Timestamp" },
    ];

    try {
      exportToCsv({
        rows: filteredReservations,
        columns,
        filename: `parklink-reservations-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      addToast("Reservations CSV exported successfully!", "success");
    } catch (err) {
      console.error("Export error:", err);
      addToast("Failed to export CSV: " + err.message, "error");
    }
  };

  const handleExportLocationsCsv = () => {
    if (locationRankData.length === 0) {
      addToast("No location performance data to export.", "warning");
      return;
    }

    const columns = [
      { key: "fullName", label: "Parking Location" },
      { key: "city", label: "City" },
      { key: "bookings", label: "Total Bookings" },
      {
        key: "revenue",
        label: "Total Revenue (Rs.)",
        formatter: (val) => Number(val || 0).toFixed(2),
      },
    ];

    try {
      exportToCsv({
        rows: locationRankData,
        columns,
        filename: `parklink-locations-performance-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      addToast("Locations summary CSV exported successfully!", "success");
    } catch (err) {
      console.error("Export error:", err);
      addToast("Failed to export CSV: " + err.message, "error");
    }
  };

  return (
    <div className="admin-reports-page">
      {/* Top Strip with Period Controls & CSV Export Buttons */}
      <div className="page-header-strip">
        <div>
          <h2 className="page-title">Reports & Business Analytics</h2>
          <p className="page-subtitle">
            Live revenue performance, peak occupancy hours, and hub utilization metrics.
          </p>
        </div>

        <div className="reports-top-actions">
          {/* Period Selector Pill Bar */}
          <div className="period-pill-selector">
            <button
              type="button"
              className={`period-btn ${period === "today" ? "active" : ""}`}
              onClick={() => setPeriod("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`period-btn ${period === "7d" ? "active" : ""}`}
              onClick={() => setPeriod("7d")}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`period-btn ${period === "30d" ? "active" : ""}`}
              onClick={() => setPeriod("30d")}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className={`period-btn ${period === "month" ? "active" : ""}`}
              onClick={() => setPeriod("month")}
            >
              This Month
            </button>
            <button
              type="button"
              className={`period-btn ${period === "all" ? "active" : ""}`}
              onClick={() => setPeriod("all")}
            >
              All Time
            </button>
          </div>

          {/* Export CSV Buttons */}
          <div className="export-btn-group">
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={handleExportReservationsCsv}
              title="Download filtered reservations report as CSV"
            >
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period KPI Summary */}
      <section className="admin-stat-grid mb-6">
        <StatCard
          title="Period Revenue"
          value={formatCurrency(metrics.revenue)}
          icon={DollarSign}
          variant="emerald"
          subtext={`From ${metrics.total} total bookings`}
          loading={loading}
        />
        <StatCard
          title="Total Reservations"
          value={metrics.total}
          icon={Calendar}
          variant="primary"
          subtext={`${metrics.activeCount} currently active`}
          loading={loading}
        />
        <StatCard
          title="Average Booking Value"
          value={formatCurrency(metrics.avgBooking)}
          icon={TrendingUp}
          variant="purple"
          subtext="Per completed parking session"
          loading={loading}
        />
        <StatCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          icon={CheckCircle}
          variant="cyan"
          subtext={`${metrics.cancelledCount} cancelled sessions`}
          loading={loading}
        />
      </section>

      {/* Chart Section 1: Revenue & Booking Trend */}
      <section className="dashboard-content-split mb-6">
        <div className="dashboard-card card-stretch">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">Revenue Trend (Rs.)</h3>
              <p className="card-subheading">Daily revenue generated across the selected period</p>
            </div>
          </div>

          <div className="chart-container" style={{ height: 280, width: "100%" }}>
            {trendData.length === 0 ? (
              <div className="chart-empty-msg">No booking activity recorded for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => formatDate(val).slice(0, 6)}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(val) => `Rs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), "Revenue"]}
                    labelFormatter={(val) => `Date: ${formatDate(val)}`}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="dashboard-card card-status-breakdown">
          <h3 className="card-heading">Booking Status Mix</h3>
          <p className="card-subheading">Ratio of confirmed, completed, and cancelled requests</p>

          <div className="chart-container" style={{ height: 200, width: "100%" }}>
            {statusPieData.length === 0 ? (
              <div className="chart-empty-msg">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pie-legend-list">
            {statusPieData.map((item) => (
              <div key={item.name} className="pie-legend-item">
                <span className="pie-color-dot" style={{ backgroundColor: item.color }}></span>
                <span className="pie-item-name">{item.name}</span>
                <span className="pie-item-val font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chart Section 2: Most-Used Locations & Peak Hours */}
      <section className="dashboard-content-split">
        {/* Most-Used Locations Bar Chart */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">Most-Used Locations</h3>
              <p className="card-subheading">Ranked by total driver reservation count</p>
            </div>
            <button
              type="button"
              className="admin-link-btn"
              onClick={handleExportLocationsCsv}
              title="Export location ranking to CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>

          <div className="chart-container" style={{ height: 260, width: "100%" }}>
            {locationRankData.length === 0 ? (
              <div className="chart-empty-msg">No location reservation data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationRankData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    formatter={(val, name) => [val, name === "bookings" ? "Reservations" : name]}
                    labelFormatter={(val, items) => items?.[0]?.payload?.fullName || val}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Peak Hours Analysis Bar Chart */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">Peak Occupancy Hours</h3>
              <p className="card-subheading">Reservation demand across daily hours (06:00 - 22:00)</p>
            </div>
          </div>

          <div className="chart-container" style={{ height: 260, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} Bookings`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
