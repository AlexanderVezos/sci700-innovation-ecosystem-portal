import { randomBytes } from "crypto";

const tokens = new Map();
const TTL = 8 * 60 * 60 * 1000;
let autoApprove = false;

export function generateToken() {
  const token = randomBytes(32).toString("hex");
  tokens.set(token, Date.now());
  return token;
}

export function validateToken(token) {
  const issuedAt = tokens.get(token);
  if (!issuedAt) return false;
  if (Date.now() - issuedAt > TTL) { tokens.delete(token); return false; }
  return true;
}

export function revokeToken(token) {
  tokens.delete(token);
}

export function getAutoApprove() {
  return autoApprove;
}

export function setAutoApprove(v) {
  autoApprove = !!v;
}
