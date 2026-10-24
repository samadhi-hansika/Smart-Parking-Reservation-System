import React from "react";
import { Sparkles } from "lucide-react";

export default function SectionHeading({ badge, title, subtitle, centered = false }) {
  return (
    <div className={`section-header ${centered ? "text-center" : ""}`}>
      {badge && (
        <div className="section-badge">
          <Sparkles className="badge-sparkle-icon" />
          <span>{badge}</span>
        </div>
      )}
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
export { SectionHeading };
