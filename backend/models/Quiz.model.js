import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: [(arr) => arr.length === 4, "Must have 4 options"] },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy","Medium","Hard"], default: "Medium" },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  timeLimit: { type: Number, default: 10 }, // minutes
  attempts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: Number,
    answers: mongoose.Schema.Types.Mixed,
    xpEarned: Number,
    takenAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
