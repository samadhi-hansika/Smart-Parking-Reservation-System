import React from "react";
import { Link } from "react-router-dom";

export default function Btn({
  children,
  to,
  onClick,
  variant = "primary", // primary | secondary | outline | ghost | white | danger | success
  size = "md", // sm | md | lg
  className = "",
  disabled = false,
  type = "button"
}) {
  const Component = to ? Link : "button";
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const variantClass = `btn-${variant}`;

  return (
    <Component
      to={to}
      onClick={onClick}
      disabled={disabled}
      type={to ? undefined : type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </Component>
  );
}
export { Btn };
