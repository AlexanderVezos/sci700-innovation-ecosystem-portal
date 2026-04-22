import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not set in .env — server will not start.");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("innovation-portal");

app.use("/api/startups", (await import("./routes/startups.js")).default(db));
app.use("/api/events", (await import("./routes/events.js")).default(db));
app.use("/api/opportunities", (await import("./routes/opportunities.js")).default(db));

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
