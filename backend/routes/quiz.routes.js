import express from "express";
import { generateQuiz, submitQuiz, getQuiz, getMyResults } from "../controllers/quiz.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.post("/generate", generateQuiz);
router.get("/my-results", getMyResults);
router.get("/:id", getQuiz);
router.post("/:id/submit", submitQuiz);

export default router;
