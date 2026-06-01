import express from "express";
import { enrollCourse, getMyEnrollments, updateProgress, checkEnrollment } from "../controllers/enrollment.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/my", getMyEnrollments);
router.get("/check/:courseId", checkEnrollment);
router.post("/:courseId/enroll", authorize("student"), enrollCourse);
router.put("/:courseId/progress", authorize("student"), updateProgress);

export default router;
