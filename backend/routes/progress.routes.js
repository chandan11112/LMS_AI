import express from "express";
import Course from "../models/Course.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const User = (await import("../models/User.model.js")).default;
    const leaders = await User.find({ role: "student" })
      .sort("-xp").limit(20)
      .select("name avatar xp badges streak").lean();
    res.json({ success: true, leaderboard: leaders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
