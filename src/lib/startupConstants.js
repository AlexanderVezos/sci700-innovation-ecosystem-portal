export const TAGS = ["HealthTech", "EdTech", "CleanTech", "FinTech", "AgriTech", "Other"];

export function isValidPhone(v) {
  if (!v) return true;
  const digits = v.replace(/\D/g, "");
  if (v.startsWith("+61") && digits.length === 11) return true;
  if (digits.startsWith("0") && digits.length === 10) return true;
  return false;
}

export function isValidEmail(v) {
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function isValidWebsite(v) {
  if (!v) return true;
  return /^https?:\/\/.+\..+/.test(v.trim());
}

export function autoFormatWebsite(v) {
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return "https://" + v;
}

export const STAGES = ["Idea", "MVP", "Growth"];

export function formatPhone(value) {
  const raw = value.replace(/[^\d+]/g, "").replace(/(?!^\+)\+/g, "");
  if (raw.startsWith("+61")) {
    const nat = raw.slice(3);
    let out = "+61";
    if (nat.length > 0) out += " " + nat.slice(0, 3);
    if (nat.length > 3) out += " " + nat.slice(3, 6);
    if (nat.length > 6) out += " " + nat.slice(6, 9);
    return out;
  }
  if (raw.startsWith("04")) {
    let out = raw.slice(0, 4);
    if (raw.length > 4) out += " " + raw.slice(4, 7);
    if (raw.length > 7) out += " " + raw.slice(7, 10);
    return out;
  }
  if (raw.startsWith("0") && raw.length >= 2) {
    let out = "(" + raw.slice(0, 2) + ")";
    if (raw.length > 2) out += " " + raw.slice(2, 6);
    if (raw.length > 6) out += " " + raw.slice(6, 10);
    return out;
  }
  return raw;
}
