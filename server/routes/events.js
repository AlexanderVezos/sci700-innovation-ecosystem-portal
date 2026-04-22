import express from "express";

export default function (db) {
  const router = express.Router();
  const events = db.collection("events");

  router.get("/", async (_req, res) => {
    res.json(await events.find().sort({ date: 1 }).toArray());
  });

  router.post("/", async (req, res) => {
    const { title, description, date, location, type, organizer, rsvpUrl } = req.body;
    if (!title || !description || !date || !location || !type || !organizer) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const result = await events.insertOne({
      title, description, date, location, type, organizer,
      rsvpUrl: rsvpUrl || null,
      createdAt: new Date(),
    });
    res.status(201).json(result);
  });

  return router;
}
