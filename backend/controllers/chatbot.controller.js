import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are LearnKro AI Assistant, a helpful and knowledgeable assistant for the LearnKro Learning Management System (LMS).

About LearnKro:
- LearnKro is an AI-powered online learning platform built with MERN stack
- Students can enroll in courses, watch video lectures, and take AI-generated quizzes
- Instructors can create and manage courses, upload videos, and track student performance
- The platform features an AI Quiz Generator that creates personalized practice questions
- There's role-based access: Student, Instructor, and Admin roles

You can help users with:
1. Platform navigation and features
2. How to enroll in courses
3. How to take quizzes and understand results
4. Course content questions
5. Technical support for using the platform
6. Learning tips and study strategies
7. Understanding quiz results and performance

Keep responses concise, helpful, and friendly. If asked about specific course content outside your knowledge, suggest checking the course materials or contacting the instructor.`;

// @desc    Chat with AI assistant
// @route   POST /api/chatbot/chat
// @access  Private
export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content;

    res.status(200).json({
      success: true,
      reply,
      usage: completion.usage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quick help topics
// @route   GET /api/chatbot/topics
// @access  Public
export const getHelpTopics = async (req, res) => {
  const topics = [
    { id: 1, question: "How do I enroll in a course?", category: "courses" },
    { id: 2, question: "How does the AI quiz work?", category: "quiz" },
    { id: 3, question: "How do I track my progress?", category: "progress" },
    { id: 4, question: "How do I become an instructor?", category: "instructor" },
    { id: 5, question: "What payment methods are accepted?", category: "payment" },
    { id: 6, question: "How do I get my certificate?", category: "certificate" },
    { id: 7, question: "Can I download course videos?", category: "videos" },
    { id: 8, question: "How to reset my password?", category: "account" },
  ];

  res.status(200).json({ success: true, topics });
};
