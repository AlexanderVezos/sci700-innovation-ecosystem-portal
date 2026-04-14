import express from "express";

export default function (db) {
  const router = express.Router();
  const startups = db.collection("startups");

  router.get("/", async (_req, res) => {
    res.json(await startups.find().toArray());
  });

  router.post("/", async (req, res) => {
    const { name, tag, description, year, employees, stage } = req.body;
    const result = await startups.insertOne({ name, tag, description, year, employees, stage, createdAt: new Date() });
    res.status(201).json(result);
  });

  return router;
}
