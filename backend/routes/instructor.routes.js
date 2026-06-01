import express from "express";
import Course from "../models/Course.model.js";
import Enrollment from "../models/Enrollment.model.js";
import { protect, authorize, isApproved } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect, authorize("instructor", "admin"));

// Get instructor's own courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort("-createdAt")
      .populate("enrolledStudents", "name")
      .lean();
    res.json({ success: true, courses });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Toggle publish
router.put("/courses/:id/publish", async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructor: req.user.id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.isPublished) {
      const hasLectures = course.sections.some((s) => s.lectures.length > 0);
      if (!hasLectures) return res.status(400).json({ success: false, message: "Add at least one lecture before publishing" });
    }
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, message: course.isPublished ? "Course published!" : "Course unpublished", course });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get students enrolled in instructor's courses
router.get("/students", async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).select("_id title");
    const courseIds = courses.map((c) => c._id);
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email avatar")
      .populate("course", "title")
      .sort("-createdAt")
      .lean();
    const students = enrollments.map((e) => ({
      ...e.student,
      enrolledCourseTitle: e.course?.title,
      enrolledAt: e.createdAt,
      progress: e.completionPercentage,
    }));
    res.json({ success: true, students });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
