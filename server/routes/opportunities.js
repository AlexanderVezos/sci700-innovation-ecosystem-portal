import express from "express";
import { ObjectId } from "mongodb";
import { getAutoApprove } from "../adminState.js";

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

  router.get("/pending", async (_req, res) => {
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
      website: website || null,
      status: getAutoApprove() ? "approved" : "pending",
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
    const result = await opportunities.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } },
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  return router;
}
