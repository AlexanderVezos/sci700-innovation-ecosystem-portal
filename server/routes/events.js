import express from "express";
import { getAutoApprove } from "../adminState.js";
import requireAdmin from "../requireAdmin.js";

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
  const events = db.collection("events");

  router.get("/", async (_req, res) => {
    res.json(
      await events.find({ status: "approved" }).sort({ date: 1 }).toArray(),
    );
  });

  router.get("/pending", requireAdmin, async (_req, res) => {
    res.json(await events.find({ status: "pending" }).toArray());
  });

  router.post("/", async (req, res) => {
    const { title, description, date, location, type, organizer, rsvpUrl } =
      req.body;
    if (!title || !description || !date || !location || !type || !organizer) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const reason = moderate({ title, description });
    if (reason) return res.status(422).json({ error: reason });

    const result = await events.insertOne({
      title,
      description,
      date,
      location,
      type,
      organizer,
      rsvpUrl: rsvpUrl || null,
      status: getAutoApprove() ? "approved" : "pending",
      createdAt: new Date(),
    });
    res.status(201).json(result);
  });

  return router;
}
