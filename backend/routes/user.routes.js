import express from "express";
import User from "../models/User.model.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const router = express.Router();
router.use(protect);

router.put("/profile", async (req, res) => {
  try {
    const updates = {};
    if (req.body.name?.trim()) updates.name = req.body.name.trim();
    if (req.body.bio !== undefined) updates.bio = req.body.bio.trim();
    if (req.files?.avatar) {
      const result = await uploadToCloudinary(req.files.avatar, "learnkro/avatars");
      updates.avatar = { url: result.url, publicId: result.publicId };
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
