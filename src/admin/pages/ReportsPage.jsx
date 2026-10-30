import React, { useState, useMemo } from "react";
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

const polarToCartesian = (cx, cy, radius, angle) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${cx} ${cy}`,
    "Z",
  ].join(" ");
};

function SimpleAreaChart({ data }) {
  const width = 520;
  const height = 250;
  const padding = { top: 16, right: 22, bottom: 28, left: 36 };
  const maxValue = Math.max(...data.map((item) => Number(item.revenue || 0)), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;
  const points = data.map((item, index) => ({
    x: padding.left + index * xStep,
    y: height - padding.bottom - (Number(item.revenue || 0) / maxValue) * chartHeight,
    value: item.revenue,
    label: item.date,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  if (data.length === 0) {
    return <div className="chart-empty-msg">No booking activity recorded for this period.</div>;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Revenue trend chart">
      {[0, 1, 2, 3, 4].map((step) => {
        const y = padding.top + (chartHeight / 4) * step;
        return <line key={step} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />;
      })}
      <path d={areaPath} fill="rgba(37, 99, 235, 0.18)" />
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      {points.map((point, index) => (
        <g key={`${point.label}-${index}`}>
          <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
          <title>{`${formatDate(point.label)}: ${formatCurrency(point.value)}`}</title>
        </g>
      ))}
      {points.map((point, index) => {
        const showLabel =
          index === 0 ||
          index === points.length - 1 ||
          index % Math.max(1, Math.ceil(points.length / 5)) === 0;
        if (!showLabel) return null;
        return (
          <text key={`label-${index}`} x={point.x} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748b">
            {formatDate(point.label).slice(0, 6)}
          </text>
        );
      })}
    </svg>
  );
}

function SimpleBarChart({ data, color, xKey, valueKey, angle = 0 }) {
  const width = 520;
  const height = 250;
  const padding = { top: 16, right: 18, bottom: 48, left: 36 };
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = (chartWidth / data.length) * 0.7;

  if (data.length === 0) {
    return <div className="chart-empty-msg">No data available.</div>;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Bar chart">
      {[0, 1, 2, 3, 4].map((step) => {
        const y = padding.top + (chartHeight / 4) * step;
        return <line key={step} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />;
      })}
      {data.map((item, index) => {
        const value = Number(item[valueKey] || 0);
        const x = padding.left + (index * chartWidth) / data.length + (chartWidth / data.length - barWidth) / 2;
        const barHeight = (value / maxValue) * chartHeight;
        const y = height - padding.bottom - barHeight;
        const label = String(item[xKey] ?? "");
        const labelX = x + barWidth / 2;
        const labelY = height - 16;

        return (
          <g key={`${label}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill={color} opacity="0.9" />
            <title>{`${item.fullName || label}: ${value}`}</title>
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
              transform={angle ? `rotate(${angle} ${labelX} ${labelY})` : undefined}
            >
              {label.length > 10 ? `${label.slice(0, 9)}…` : label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SimplePieChart({ data }) {
  const width = 220;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 72;
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  let startAngle = 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Status breakdown chart">
      {data.map((item, index) => {
        const sliceAngle = (Number(item.value || 0) / total) * 360;
        const endAngle = startAngle + sliceAngle;
        const path =
          sliceAngle >= 360
            ? `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy - radius} Z`
            : describeArc(cx, cy, radius, startAngle, endAngle);
        startAngle = endAngle;
        return (
          <path key={`${item.name}-${index}`} d={path} fill={item.color} stroke="#fff" strokeWidth="2" opacity="0.92">
            <title>{`${item.name}: ${item.value}`}</title>
          </path>
        );
      })}
      <circle cx={cx} cy={cy} r="36" fill="#fff" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="12" fill="#64748b">Total</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">{total}</text>
    </svg>
  );
}

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
            <SimpleAreaChart data={trendData} />
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
              <SimplePieChart data={statusPieData} />
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
              <SimpleBarChart
                data={locationRankData}
                color="#3b82f6"
                xKey="name"
                valueKey="bookings"
                angle={-15}
              />
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
            <SimpleBarChart data={peakHoursData} color="#10b981" xKey="hour" valueKey="bookings" />
          </div>
        </div>
      </section>
    </div>
  );
}
