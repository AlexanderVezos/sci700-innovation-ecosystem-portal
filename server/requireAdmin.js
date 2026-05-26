import { validateToken } from "./adminState.js";

export default function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  if (!validateToken(auth.slice(7)))
    return res.status(401).json({ error: "Unauthorized" });
  next();
}
