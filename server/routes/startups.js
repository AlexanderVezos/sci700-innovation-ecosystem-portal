import express from "express";
import { ObjectId } from "mongodb";

const GIBBERISH = /^(.)\1{4,}$|^[^aeiouy\s]{7,}$/i;

function moderate(fields) {
  if (GIBBERISH.test(fields.name?.trim()))
    return "Company name doesn't appear to be valid.";
  if (fields.description?.trim().split(/\s+/).length < 4)
    return "Description is too short to be meaningful.";
  return null;
}

export default function (db) {
  const router = express.Router();
  const startups = db.collection("startups");

  router.get("/", async (_req, res) => {
    res.json(
      await startups.find({ status: "approved" }).sort({ name: 1 }).toArray(),
    );
  });

  router.get("/pending", async (_req, res) => {
    res.json(await startups.find({ status: "pending" }).toArray());
  });

  router.post("/", async (req, res) => {
    const {
      name,
      tag,
      description,
      year,
      employees,
      stage,
      email,
      website,
      phone,
    } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const reason = moderate({ name, description });
    if (reason) return res.status(422).json({ error: reason });

    const result = await startups.insertOne({
      name,
      tag,
      description,
      year: Number(year),
      employees: Number(employees),
      stage,
      email,
      website,
      phone,
      status: "pending",
      createdAt: new Date(),
    });
    res.status(201).json(result);
  });

  router.patch("/:id", async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "status must be 'approved' or 'rejected'" });
    }
    const result = await startups.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } },
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  return router;
}
