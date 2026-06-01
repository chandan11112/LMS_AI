import express from "express";
import {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  addSection, addLecture, deleteLecture, addComment, rateCourse,
} from "../controllers/course.controller.js";
import { protect, authorize, isApproved, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", optionalAuth, getCourse);
router.post("/", protect, authorize("instructor", "admin"), isApproved, createCourse);
router.put("/:id", protect, authorize("instructor", "admin"), updateCourse);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteCourse);

router.post("/:id/sections", protect, authorize("instructor", "admin"), isApproved, addSection);
router.post("/:id/sections/:sectionId/lectures", protect, authorize("instructor", "admin"), isApproved, addLecture);
router.delete("/:id/sections/:sectionId/lectures/:lectureId", protect, authorize("instructor", "admin"), deleteLecture);
router.post("/:id/sections/:sectionId/lectures/:lectureId/comments", protect, addComment);
router.post("/:id/rate", protect, authorize("student"), rateCourse);

export default router;
