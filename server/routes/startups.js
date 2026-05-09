import express from "express";
import { getAutoApprove } from "../adminState.js";
import requireAdmin from "../requireAdmin.js";

const safeUrl = (u) => (u && /^https?:\/\//i.test(u) ? u : null);

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

  router.get("/pending", requireAdmin, async (_req, res) => {
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
      website: safeUrl(website),
      phone,
      status: getAutoApprove() ? "approved" : "pending",
      createdAt: new Date(),
    });
    res.status(201).json(result);
  });

  return router;
}
