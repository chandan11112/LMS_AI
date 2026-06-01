import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, Loader2, BookOpen, Target, Hash, ChevronRight } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const TOPICS = [
  "JavaScript","React","Node.js","Python","Data Structures",
  "Machine Learning","CSS","TypeScript","SQL","System Design",
];
const DIFFICULTIES = ["Easy","Medium","Hard"];

export default function QuizGeneratorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ topic: "", difficulty: "Medium", numQuestions: 5, context: "" });

  const generateMutation = useMutation({
    mutationFn: () => api.post("/quiz/generate", form),
    onSuccess: ({ data }) => {
      toast.success("Quiz generated! Good luck 🎯");
      navigate(`/quiz/${data.quiz._id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to generate quiz"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return toast.error("Please enter a topic");
    generateMutation.mutate();
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-900/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">AI Quiz Generator</h1>
          <p className="text-gray-500">Generate a personalized quiz on any topic using AI</p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic */}
            <div>
              <label className="input-label">Topic <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. React Hooks, Python Decorators, SQL Joins..."
                className="input"
              />
              <div className="flex flex-wrap gap-2 mt-2.5">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, topic: t })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      form.topic === t
                        ? "bg-violet-600 text-white"
                        : "bg-white/[0.05] text-gray-500 hover:bg-white/[0.09] hover:text-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="input-label flex items-center gap-2">
                <Target size={13} className="text-violet-400" /> Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, difficulty: d })}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      form.difficulty === d
                        ? d === "Easy" ? "bg-green-500/15 border-green-500/30 text-green-400"
                          : d === "Medium" ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"
                          : "bg-red-500/15 border-red-500/30 text-red-400"
                        : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:bg-white/[0.07] hover:text-gray-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label className="input-label flex items-center gap-2">
                <Hash size={13} className="text-violet-400" /> Number of Questions
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={form.numQuestions}
                  onChange={(e) => setForm({ ...form, numQuestions: Number(e.target.value) })}
                  className="flex-1 accent-violet-500"
                />
                <span className="w-10 text-center font-bold text-white text-lg">{form.numQuestions}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span>3 (Quick)</span>
                <span>15 (Comprehensive)</span>
              </div>
            </div>

            {/* Optional context */}
            <div>
              <label className="input-label flex items-center gap-2">
                <BookOpen size={13} className="text-violet-400" />
                Additional Context <span className="text-gray-700 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                rows={3}
                placeholder="Add specific topics, concepts, or learning objectives you want to be tested on..."
                className="input resize-none text-sm"
                maxLength={500}
              />
              <p className="text-xs text-gray-700 mt-1">{form.context.length}/500</p>
            </div>

            {/* Preview */}
            {form.topic && (
              <div className="glass-sm p-4 rounded-xl">
                <p className="text-xs text-gray-600 mb-2 font-medium">Quiz Preview</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-white font-medium">{form.numQuestions} questions</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{form.topic}</span>
                  <span className="text-gray-600">•</span>
                  <span className={form.difficulty === "Easy" ? "text-green-400" : form.difficulty === "Medium" ? "text-yellow-400" : "text-red-400"}>
                    {form.difficulty}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={generateMutation.isPending || !form.topic.trim()}
              className="btn-primary w-full btn-lg"
            >
              {generateMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Generating with AI...</>
              ) : (
                <><Sparkles size={18} /> Generate Quiz <ChevronRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: "🎯", title: "Personalized", desc: "Questions tailored to your level" },
            { icon: "⚡", title: "Instant", desc: "AI generates quiz in seconds" },
            { icon: "🏆", title: "Earn XP", desc: "Get XP for every quiz you take" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card p-4 text-center">
              <span className="text-2xl mb-2 block">{icon}</span>
              <p className="font-semibold text-white text-xs">{title}</p>
              <p className="text-xs text-gray-600 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
