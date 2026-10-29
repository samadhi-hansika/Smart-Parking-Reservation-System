import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  variant = "primary",
  trend,
  trendLabel,
  subtext,
  loading = false,
  onClick,
}) {
  return (
    <div
      className={`admin-stat-card stat-variant-${variant} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="admin-stat-card-top">
        <span className="admin-stat-label">{title}</span>
        {Icon && (
          <div className={`admin-stat-icon-wrap icon-bg-${variant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="admin-stat-card-value">
        {loading ? (
          <div className="admin-stat-skeleton"></div>
        ) : (
          <span className="admin-stat-number">{value}</span>
        )}
      </div>

      {(trend !== undefined || subtext) && (
        <div className="admin-stat-footer">
          {trend !== undefined && (
            <span className={`admin-stat-trend ${trend >= 0 ? "trend-up" : "trend-down"}`}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span className="admin-stat-trend-label">{trendLabel}</span>}
          {subtext && <span className="admin-stat-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
