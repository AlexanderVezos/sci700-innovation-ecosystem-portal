import express from "express";
import { v2 as cloudinary } from "cloudinary";
import requireAdmin from "../requireAdmin.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default function () {
  const router = express.Router();

  // Accepts { data: "data:image/...;base64,..." } — returns { url }
  router.post("/", requireAdmin, async (req, res) => {
    const { data } = req.body;
    if (!data || !data.startsWith("data:image/")) {
      return res.status(400).json({ error: "Expected a base64 image data URI." });
    }
    try {
      const result = await cloudinary.uploader.upload(data, {
        folder: "innovation-portal/stories",
        resource_type: "image",
      });
      res.json({ url: result.secure_url });
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      res.status(500).json({ error: "Upload failed." });
    }
  });

  return router;
}
