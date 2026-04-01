import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("innovation-portal");

app.use("/api/entries", (await import("./routes/entries.js")).default(db));

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
