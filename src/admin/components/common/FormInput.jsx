import React from "react";

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  options = [], // for select type
  rows = 3, // for textarea
  prefix,
  suffix,
  min,
  max,
  step,
  className = "",
}) {
  return (
    <div className={`admin-form-group ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={name} className="admin-form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="admin-input-wrapper">
        {prefix && <span className="admin-input-prefix">{prefix}</span>}

        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`admin-form-input admin-textarea ${prefix ? "with-prefix" : ""} ${
              suffix ? "with-suffix" : ""
            }`}
          />
        ) : type === "select" ? (
          <select
            id={name}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            disabled={disabled}
            className={`admin-form-input admin-select ${prefix ? "with-prefix" : ""} ${
              suffix ? "with-suffix" : ""
            }`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const optVal = typeof opt === "object" ? opt.value : opt;
              const optLabel = typeof opt === "object" ? opt.label : opt;
              return (
                <option key={optVal} value={optVal}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`admin-form-input ${prefix ? "with-prefix" : ""} ${
              suffix ? "with-suffix" : ""
            }`}
          />
        )}

        {suffix && <span className="admin-input-suffix">{suffix}</span>}
      </div>

      {error && <p className="admin-form-error">{error}</p>}
      {!error && hint && <p className="admin-form-hint">{hint}</p>}
    </div>
  );
}
