import express from "express";
import Groq from "groq-sdk";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "Message required" });

    const messages = [
      { role: "system", content: "You are an expert AI study assistant for LearnKro, an online learning platform. Help students understand concepts, debug code, explain topics clearly, and motivate them. Keep responses concise and educational." },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = response.choices[0]?.message?.content?.trim();
    res.json({ success: true, reply });
  } catch (e) {
    res.status(500).json({ success: false, message: "AI assistant unavailable. Please try again." });
  }
});

export default router;
