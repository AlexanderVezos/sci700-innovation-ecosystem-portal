import express from "express";
import { generateToken, revokeToken, getAutoApprove, setAutoApprove } from "../adminState.js";
import requireAdmin from "../requireAdmin.js";
import { ObjectId } from "mongodb";

export default function (db) {
  const router = express.Router();
  const startups = db.collection("startups");
  const events = db.collection("events");
  const opps = db.collection("opportunities");

  // ── Auth ──────────────────────────────────────────────────────────────────

  router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ token: generateToken() });
  });

  router.post("/logout", requireAdmin, (req, res) => {
    revokeToken(req.headers.authorization.slice(7));
    res.json({ ok: true });
  });

  // ── Pending (all three collections) ──────────────────────────────────────

  router.get("/pending", requireAdmin, async (_req, res) => {
    const [pendingStartups, pendingEvents, pendingOpps] = await Promise.all([
      startups.find({ status: "pending" }).sort({ createdAt: 1 }).toArray(),
      events.find({ status: "pending" }).sort({ createdAt: 1 }).toArray(),
      opps.find({ status: "pending" }).sort({ createdAt: 1 }).toArray(),
    ]);
    res.json({ startups: pendingStartups, events: pendingEvents, opportunities: pendingOpps });
  });

  // ── Approve / Reject (proxies for each collection) ───────────────────────

  router.patch("/startups/:id", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const result = await startups.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  router.patch("/events/:id", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const result = await events.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  router.patch("/opportunities/:id", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const result = await opps.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  // ── Settings ──────────────────────────────────────────────────────────────

  router.get("/settings", requireAdmin, (_req, res) => {
    res.json({ autoApprove: getAutoApprove() });
  });

  router.patch("/settings", requireAdmin, (req, res) => {
    if (typeof req.body.autoApprove === "boolean") setAutoApprove(req.body.autoApprove);
    res.json({ autoApprove: getAutoApprove() });
  });

  return router;
}
