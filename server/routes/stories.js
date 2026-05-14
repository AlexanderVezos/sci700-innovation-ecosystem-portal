import express from "express";
import { ObjectId } from "mongodb";
import requireAdmin from "../requireAdmin.js";

export default function (db) {
  const router = express.Router();
  const stories = db.collection("stories");

  // ── Public ────────────────────────────────────────────────────────────────

  router.get("/", async (_req, res) => {
    const docs = await stories
      .find({ status: "published" })
      .sort({ publishedAt: -1 })
      .toArray();
    res.json(docs);
  });

  router.get("/:id", async (req, res) => {
    let doc;
    try {
      doc = await stories.findOne({
        _id: new ObjectId(req.params.id),
        status: "published",
      });
    } catch {
      return res.status(400).json({ error: "Invalid id." });
    }
    if (!doc) return res.status(404).json({ error: "Not found." });
    res.json(doc);
  });

  // ── Admin ─────────────────────────────────────────────────────────────────

  router.get("/admin/all", requireAdmin, async (_req, res) => {
    const docs = await stories.find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  });

  router.post("/", requireAdmin, async (req, res) => {
    const { title, body, imageUrl, featured, status } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: "title and body are required." });
    }
    const now = new Date();
    const doc = {
      title: title.trim(),
      body: body.trim(),
      imageUrl: imageUrl?.trim() || null,
      featured: Boolean(featured),
      status: status === "published" ? "published" : "draft",
      publishedAt: status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await stories.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  });

  router.patch("/:id", requireAdmin, async (req, res) => {
    let oid;
    try {
      oid = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid id." });
    }
    const { title, body, imageUrl, featured, status } = req.body;
    const now = new Date();
    const set = { updatedAt: now };
    if (title !== undefined) set.title = title.trim();
    if (body !== undefined) set.body = body.trim();
    if (imageUrl !== undefined) set.imageUrl = imageUrl?.trim() || null;
    if (featured !== undefined) set.featured = Boolean(featured);
    if (status !== undefined) {
      set.status = status === "published" ? "published" : "draft";
      set.publishedAt = status === "published" ? now : null;
    }
    const result = await stories.findOneAndUpdate(
      { _id: oid },
      { $set: set },
      { returnDocument: "after" },
    );
    if (!result) return res.status(404).json({ error: "Not found." });
    res.json(result);
  });

  router.delete("/:id", requireAdmin, async (req, res) => {
    let oid;
    try {
      oid = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid id." });
    }
    const result = await stories.deleteOne({ _id: oid });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Not found." });
    res.json({ ok: true });
  });

  return router;
}
