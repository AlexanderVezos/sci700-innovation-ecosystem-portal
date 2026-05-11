import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
    },
  },
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || "https://startupsc.punkrecords.xyz" }));
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not set in .env — server will not start.");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("innovation-portal");

app.use("/api/admin", (await import("./routes/admin.js")).default(db));
app.use("/api/startups", (await import("./routes/startups.js")).default(db));
app.use("/api/events", (await import("./routes/events.js")).default(db));
app.use(
  "/api/opportunities",
  (await import("./routes/opportunities.js")).default(db),
);
app.use("/api/stories", (await import("./routes/stories.js")).default(db));
app.use("/api/upload",  (await import("./routes/upload.js")).default());

app.use(express.static(path.join(__dirname, "../dist")));
app.get("/{*path}", (_req, res) => res.sendFile(path.join(__dirname, "../dist/index.html")));

app.listen(3002, () => console.log("Server running on http://localhost:3002"));
