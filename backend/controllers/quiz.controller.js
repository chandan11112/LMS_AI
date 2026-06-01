import Groq from "groq-sdk";
import Quiz from "../models/Quiz.model.js";
import User from "../models/User.model.js";
import dotenv from "dotenv";
dotenv.config();


// FIX: initialize client once, not on every request
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = "Medium", numQuestions = 5, context = "" } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ success: false, message: "numQuestions must be between 1 and 20" });
    }

    const prompt = `Generate a ${difficulty.toLowerCase()} difficulty quiz about "${topic}" with exactly ${numQuestions} multiple choice questions.
${context ? `Additional context: ${context}` : ""}

Return ONLY valid JSON in this exact format (no extra text, no markdown):
{
  "title": "Quiz title here",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

Rules:
- correctAnswer is the 0-based index of the correct option
- Each question must have exactly 4 options
- Explanations should be 1-2 sentences
- Questions should be clear and unambiguous`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("AI returned empty response");

    // FIX: strip markdown fences if present before parsing
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    let quizData;
    try {
      quizData = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned invalid JSON. Please try again.");
    }

    if (!quizData.questions?.length) {
      throw new Error("AI did not return any questions. Please try again.");
    }

    // Validate each question
    for (const q of quizData.questions) {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error("Invalid question format from AI");
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error("Invalid correctAnswer index from AI");
      }
    }

    const quiz = await Quiz.create({
      title: quizData.title || `${topic} Quiz`,
      topic: topic.trim(),
      difficulty,
      questions: quizData.questions,
      createdBy: req.user.id,
      timeLimit: Math.ceil(numQuestions * 1.5), // 1.5 minutes per question
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error("[Quiz Generate Error]", error.message);
    if (error.message.includes("AI")) {
      return res.status(503).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Failed to generate quiz. Please try again." });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    let correct = 0;
    const reviewData = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        question: q.question,
        userAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const xpEarned = score >= 60 ? Math.round(score / 10) * 10 : 5;

    // Save attempt
    quiz.attempts.push({ user: req.user.id, score, answers: reviewData, xpEarned });
    await quiz.save();

    // Award XP
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: xpEarned } });

    res.status(200).json({
      success: true,
      result: {
        score,
        correct,
        total: quiz.questions.length,
        xpEarned,
        passed: score >= 60,
        review: reviewData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.correctAnswer -questions.explanation");
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.status(200).json({ success: true, quiz });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getMyResults = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ "attempts.user": req.user.id })
      .select("title topic difficulty attempts")
      .lean();

    const results = quizzes.map((q) => {
      const userAttempts = q.attempts.filter((a) => a.user?.toString() === req.user.id);
      const bestScore = Math.max(...userAttempts.map((a) => a.score));
      return { quizId: q._id, title: q.title, topic: q.topic, bestScore, totalAttempts: userAttempts.length };
    });

    res.status(200).json({ success: true, results });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
