import { useState } from "react";
import { formatPhone, isValidPhone, isValidEmail, isValidWebsite, autoFormatWebsite } from "@/lib/startupConstants";

// ─── Shared validation UI ─────────────────────────────────────────────────────

function ValidatedInput({ value, onChange, onBlur, placeholder, type = "text", className, isValid, hint }) {
  const showValid = isValid === true;
  const showInvalid = isValid === false;
  const ringClass = showValid ? "ring-1 ring-emerald-400" : showInvalid ? "ring-1 ring-red-400" : "";

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${className} ${ringClass} pr-9`}
        />
        {(showValid || showInvalid) && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none ${showValid ? "text-emerald-500" : "text-red-400"}`}>
            {showValid ? "✓" : "✕"}
          </span>
        )}
      </div>
      {showInvalid && <p className="text-xs text-red-400">{hint}</p>}
    </div>
  );
}

// ─── Phone ────────────────────────────────────────────────────────────────────

export function PhoneField({ value, onChange, className }) {
  const [touched, setTouched] = useState(false);
  const isValid = !value ? null : touched ? isValidPhone(value) : null;

  return (
    <ValidatedInput
      type="tel"
      value={value}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      onBlur={() => setTouched(true)}
      placeholder="0412 345 678"
      className={className}
      isValid={isValid}
      hint="Enter a full Australian number, e.g. 0412 345 678 or +61 2 1234 5678"
    />
  );
}

// ─── Email ────────────────────────────────────────────────────────────────────

export function EmailField({ value, onChange, className }) {
  const [touched, setTouched] = useState(false);
  const isValid = !value ? null : touched ? isValidEmail(value) : null;

  return (
    <ValidatedInput
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setTouched(true)}
      placeholder="hello@example.com"
      className={className}
      isValid={isValid}
      hint="Must include an @ and a domain, e.g. hello@example.com"
    />
  );
}

// ─── Website ──────────────────────────────────────────────────────────────────

export function WebsiteField({ value, onChange, className }) {
  const [touched, setTouched] = useState(false);
  const isValid = !value ? null : touched ? isValidWebsite(value) : null;

  function handleBlur() {
    setTouched(true);
    if (value) onChange(autoFormatWebsite(value));
  }

  return (
    <ValidatedInput
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      placeholder="https://example.com"
      className={className}
      isValid={isValid}
      hint="Must be a valid URL. Leaving the field will auto-add https://"
    />
  );
}
