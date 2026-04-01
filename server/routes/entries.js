import express from "express";

export default function (db) {
  const router = express.Router();
  const entries = db.collection("entries");

  router.get("/", async (_req, res) => {
    res.json(await entries.find().toArray());
  });

  router.post("/", async (req, res) => {
    const result = await entries.insertOne(req.body);
    res.status(201).json(result);
  });

  return router;
}
