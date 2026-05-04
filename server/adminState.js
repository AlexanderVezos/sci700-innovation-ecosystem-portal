import { randomBytes } from "crypto";

const tokens = new Set();
let autoApprove = false;

export function generateToken() {
  const token = randomBytes(32).toString("hex");
  tokens.add(token);
  return token;
}

export function validateToken(token) {
  return tokens.has(token);
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
