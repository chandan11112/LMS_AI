import express from "express";
import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Enrollment from "../models/Enrollment.model.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, pendingInstructors] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      User.countDocuments({ role: "instructor", isApproved: false }),
    ]);
    res.json({ success: true, totalUsers, totalCourses, totalEnrollments, pendingInstructors });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt").select("-password").limit(100).lean();
    res.json({ success: true, users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put("/users/:id/approve", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: req.body.ban }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort("-createdAt").populate("instructor", "name").limit(100).lean();
    res.json({ success: true, courses });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
