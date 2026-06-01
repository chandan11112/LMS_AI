import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  Trophy, Loader2, AlertCircle, RotateCcw, Home, Zap
} from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";
import toast from "react-hot-toast";

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuthStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => api.get(`/quiz/${quizId}`).then((r) => r.data.quiz),
  });

  // Initialize timer when quiz loads
  useEffect(() => {
    if (quiz && !submitted) {
      const seconds = (quiz.timeLimit || 10) * 60;
      setTimeLeft(seconds);
    }
  }, [quiz]);

  // Countdown
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const submitMutation = useMutation({
    mutationFn: (payload) => api.post(`/quiz/${quizId}/submit`, payload),
    onSuccess: ({ data }) => {
      setResult(data.result);
      setSubmitted(true);
      updateUser({ xp: (user?.xp || 0) + (data.result.xpEarned || 0) });
      if (data.result.score >= 60) {
        toast.success(`🎉 Score: ${data.result.score}%! +${data.result.xpEarned} XP earned`);
      } else {
        toast(`Score: ${data.result.score}%. Keep practicing!`, { icon: "📚" });
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || "Submission failed"),
  });

  const handleSubmit = useCallback((auto = false) => {
    if (submitted || submitMutation.isPending) return;
    if (!auto) {
      const answered = Object.keys(answers).length;
      const total = quiz?.questions?.length || 0;
      if (answered < total) {
        const confirm = window.confirm(`You've answered ${answered}/${total} questions. Submit anyway?`);
        if (!confirm) return;
      }
    }
    submitMutation.mutate({ answers });
  }, [answers, quiz, submitted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    </div>
  );

  if (!quiz) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400">Quiz not found</p>
        <button onClick={() => navigate("/dashboard/quiz-generator")} className="btn-outline mt-4">Back</button>
      </div>
    </div>
  );

  // Results screen
  if (submitted && result) {
    const passed = result.score >= 60;
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-lg w-full animate-slide-up">
          <div className="card p-8 text-center">
            {/* Score circle */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={passed ? "#10b981" : "#f87171"}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - result.score / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display font-bold text-3xl ${passed ? "text-green-400" : "text-red-400"}`}>
                  {result.score}%
                </span>
              </div>
            </div>

            <div className="text-4xl mb-3">{passed ? "🎉" : "📚"}</div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              {passed ? "Excellent Work!" : "Keep Practicing!"}
            </h2>
            <p className="text-gray-500 mb-6">
              {result.correct}/{result.total} correct answers
            </p>

            {result.xpEarned > 0 && (
              <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Zap size={16} className="text-violet-400" />
                <span className="text-violet-300 font-semibold">+{result.xpEarned} XP earned!</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-7">
              {[
                { label: "Correct", value: result.correct, color: "text-green-400" },
                { label: "Wrong", value: result.total - result.correct, color: "text-red-400" },
                { label: "Total", value: result.total, color: "text-violet-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-sm p-3 text-center rounded-xl">
                  <p className={`font-bold text-xl ${color}`}>{value}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="btn-secondary w-full mb-3"
            >
              {showExplanations ? "Hide" : "Review"} Answers & Explanations
            </button>

            <div className="flex gap-3">
              <button onClick={() => navigate("/dashboard/quiz-generator")} className="flex-1 btn-secondary btn-sm">
                <RotateCcw size={14} /> New Quiz
              </button>
              <button onClick={() => navigate("/dashboard")} className="flex-1 btn-outline btn-sm">
                <Home size={14} /> Dashboard
              </button>
            </div>
          </div>

          {/* Explanations */}
          {showExplanations && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {quiz.questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={i} className={`card p-5 border ${isCorrect ? "border-green-500/20" : "border-red-500/15"}`}>
                    <p className="text-sm font-medium text-white mb-3">
                      <span className="text-gray-600 mr-2">Q{i + 1}.</span>{q.question}
                    </p>
                    {q.options.map((opt, j) => {
                      const isUserAnswer = userAnswer === j;
                      const isCorrectAnswer = q.correctAnswer === j;
                      return (
                        <div
                          key={j}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1.5 text-sm ${
                            isCorrectAnswer
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : isUserAnswer
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "text-gray-600"
                          }`}
                        >
                          {isCorrectAnswer ? <CheckCircle size={13} /> : isUserAnswer ? <XCircle size={13} /> : <span className="w-3.5" />}
                          {opt}
                        </div>
                      );
                    })}
                    {q.explanation && (
                      <p className="text-xs text-gray-500 mt-3 p-3 bg-white/[0.03] rounded-lg leading-relaxed">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz screen
  const question = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const isLastQuestion = current === quiz.questions.length - 1;
  const isTimeLow = timeLeft !== null && timeLeft <= 60;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1.5">{quiz.title}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-600">{answered}/{quiz.questions.length} answered</span>
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold border ${
                isTimeLow
                  ? "bg-red-500/15 border-red-500/25 text-red-400 animate-pulse"
                  : "bg-white/[0.05] border-white/[0.08] text-gray-300"
              }`}>
                <Clock size={13} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="max-w-2xl w-full animate-fade-in" key={current}>
          <div className="card p-7">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-gray-600 font-medium">
                Question {current + 1} of {quiz.questions.length}
              </span>
              {answers[current] !== undefined && (
                <span className="badge bg-violet-500/15 text-violet-400 border border-violet-500/20 text-xs">Answered</span>
              )}
            </div>

            <h2 className="font-display font-semibold text-xl text-white leading-relaxed mb-7">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((opt, j) => (
                <button
                  key={j}
                  onClick={() => setAnswers({ ...answers, [current]: j })}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all duration-150 border ${
                    answers[current] === j
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-200 shadow-lg shadow-violet-900/20"
                      : "bg-white/[0.03] border-white/[0.07] text-gray-400 hover:bg-white/[0.07] hover:text-white hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      answers[current] === j
                        ? "bg-violet-500 text-white"
                        : "bg-white/[0.06] text-gray-500"
                    }`}>
                      {String.fromCharCode(65 + j)}
                    </span>
                    {opt}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => setCurrent((c) => c - 1)}
              disabled={current === 0}
              className="btn-secondary btn-sm disabled:opacity-30"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div className="flex gap-1.5">
              {quiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    i === current
                      ? "bg-violet-600 text-white"
                      : answers[i] !== undefined
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-white/[0.05] text-gray-600 hover:bg-white/[0.09]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitMutation.isPending}
                className="btn-primary btn-sm"
              >
                {submitMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
                Submit Quiz
              </button>
            ) : (
              <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary btn-sm">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
