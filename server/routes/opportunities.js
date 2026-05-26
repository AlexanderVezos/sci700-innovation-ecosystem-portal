import express from "express";
import { getAutoApprove } from "../adminState.js";
import requireAdmin from "../requireAdmin.js";

const safeUrl = (u) => (u && /^https?:\/\//i.test(u) ? u : null);

const GIBBERISH = /^(.)\1{4,}$|^[^aeiouy\s]{7,}$/i;

function moderate(fields) {
  if (GIBBERISH.test(fields.title?.trim()))
    return "Title doesn't appear to be valid.";
  if (fields.description?.trim().split(/\s+/).length < 4)
    return "Description is too short to be meaningful.";
  return null;
}

export default function (db) {
  const router = express.Router();
  const opportunities = db.collection("opportunities");

  router.get("/", async (_req, res) => {
    res.json(
      await opportunities
        .find({ status: "approved" })
        .sort({ createdAt: -1 })
        .toArray(),
    );
  });

  router.get("/pending", requireAdmin, async (_req, res) => {
    res.json(await opportunities.find({ status: "pending" }).toArray());
  });

  router.post("/", async (req, res) => {
    const {
      title,
      description,
      type,
      organisation,
      sector,
      deadline,
      email,
      website,
    } = req.body;
    if (!title || !description || !type || !organisation) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const reason = moderate({ title, description, organisation });
    if (reason) return res.status(422).json({ error: reason });

    const result = await opportunities.insertOne({
      title,
      description,
      type,
      organisation,
      sector: sector || null,
      deadline: deadline || null,
      email: email || null,
      website: safeUrl(website),
      status: getAutoApprove() ? "approved" : "pending",
      createdAt: new Date(),
    });
    res.status(201).json(result);
  });

  return router;
}
