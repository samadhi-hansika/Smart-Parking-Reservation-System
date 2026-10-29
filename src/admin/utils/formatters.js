/**
 * ParkLink Admin Module - Formatters & Helper Utilities
 */

/**
 * Format currency to Sri Lankan Rupees (LKR)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format currency compact (e.g. Rs. 15.2K)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrencyCompact(amount) {
  const num = Number(amount) || 0;
  if (num >= 1_000_000) {
    return `Rs. ${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `Rs. ${(num / 1_000).toFixed(1)}K`;
  }
  return `Rs. ${num.toLocaleString("en-LK")}`;
}

/**
 * Format standard ISO date or YYYY-MM-DD
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return "—";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal.includes("T") ? dateVal : `${dateVal}T00:00:00`) : new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Format ISO datetime string
 * @param {string|Date} isoVal
 * @returns {string}
 */
export function formatDateTime(isoVal) {
  if (!isoVal) return "—";
  try {
    const d = new Date(isoVal);
    if (isNaN(d.getTime())) return String(isoVal);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(isoVal);
  }
}

/**
 * Format 24-hr time to 12-hr AM/PM
 * @param {string} timeStr - "14:30"
 * @returns {string}
 */
export function formatTime12(timeStr) {
  if (!timeStr) return "—";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? "PM" : "AM";
    const adjustedHour = h % 12 === 0 ? 12 : h % 12;
    return `${adjustedHour}:${String(m || 0).padStart(2, "0")} ${period}`;
  } catch {
    return timeStr;
  }
}

/**
 * Format duration in hours
 * @param {number} hours
 * @returns {string}
 */
export function formatDuration(hours) {
  const h = Number(hours) || 0;
  if (h < 1) {
    return `${Math.round(h * 60)} mins`;
  }
  const whole = Math.floor(h);
  const minutes = Math.round((h - whole) * 60);
  return minutes > 0 ? `${whole}h ${minutes}m` : `${whole} hr${whole > 1 ? "s" : ""}`;
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return "";
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

/**
 * Extract normalized reservation amount (handles amount or totalAmount)
 * @param {object} res
 * @returns {number}
 */
export function getReservationAmount(res) {
  if (!res) return 0;
  return Number(res.amount || res.totalAmount || 0);
}
