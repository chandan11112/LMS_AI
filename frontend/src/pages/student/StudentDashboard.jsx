import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BookOpen, Brain, TrendingUp, CheckCircle, ArrowRight, Play,
  Zap, Trophy, Flame, Star, Clock, ChevronRight
} from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";

function StatCard({ label, value, icon: Icon, gradient, link }) {
  const content = (
    <div className="card p-5 flex items-center gap-4 transition-all duration-200 hover:border-white/[0.12]">
      <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-display font-bold text-2xl text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

function SkeletonCard() {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="skeleton w-16 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 rounded w-3/4" />
        <div className="skeleton h-2 rounded w-full" />
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.get("/enrollments/my").then((r) => r.data.enrollments),
  });

  const { data: quizResults } = useQuery({
    queryKey: ["my-quiz-results"],
    queryFn: () => api.get("/quiz/my-results").then((r) => r.data.results),
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.get("/progress/leaderboard").then((r) => r.data.leaderboard),
  });

  const avgProgress = enrollments?.length
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.completionPercentage || 0), 0) / enrollments.length)
    : 0;

  const completedCount = enrollments?.filter((e) => e.isCompleted).length || 0;

  const stats = [
    { label: "Enrolled Courses", value: enrollments?.length || 0, icon: BookOpen, gradient: "from-violet-500 to-purple-700", link: "/dashboard/my-courses" },
    { label: "Quizzes Taken", value: quizResults?.length || 0, icon: Brain, gradient: "from-indigo-500 to-blue-700", link: "/dashboard/quiz-generator" },
    { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, gradient: "from-emerald-500 to-green-700" },
    { label: "Completed", value: completedCount, icon: CheckCircle, gradient: "from-orange-500 to-rose-600" },
  ];

  const myRank = leaderboard?.findIndex((l) => l._id === user?._id);

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1.5">Continue your learning journey</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
            <Zap size={14} className="text-violet-400" />
            <span className="text-sm font-bold text-violet-300">{user?.xp || 0} XP</span>
          </div>
          {user?.streak > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-400">
              <Flame size={12} /> {user.streak} day streak
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-white">Continue Learning</h2>
              <Link to="/dashboard/my-courses" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loadingEnrollments ? (
              <div className="space-y-4">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>
            ) : enrollments?.length > 0 ? (
              <div className="space-y-3">
                {enrollments.slice(0, 4).map((enrollment) => (
                  <Link
                    key={enrollment._id}
                    to={`/learn/${enrollment.course?._id}`}
                    className="card p-4 flex items-center gap-4 hover:border-violet-500/25 transition-all group"
                  >
                    <div className="w-14 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0d14]">
                      {enrollment.course?.thumbnail?.url ? (
                        <img src={enrollment.course.thumbnail.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-violet-500/10">
                          <BookOpen className="w-5 h-5 text-violet-400/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate group-hover:text-violet-300 transition-colors">
                        {enrollment.course?.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 progress-bar">
                          <div className="progress-fill" style={{ width: `${enrollment.completionPercentage}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap font-medium">{enrollment.completionPercentage}%</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                      <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-violet-400/40" />
                </div>
                <p className="text-gray-500 mb-5">Start your learning journey today</p>
                <Link to="/courses" className="btn-primary">Browse Courses</Link>
              </div>
            )}
          </div>

          {/* Badges */}
          {user?.badges?.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-lg text-white mb-4">My Badges</h2>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge, i) => (
                  <div key={i} className="glass-sm px-4 py-2.5 flex items-center gap-2">
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-sm font-medium text-gray-300">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="font-display font-semibold text-lg text-white mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              <Link to="/dashboard/quiz-generator"
                className="card p-4 flex items-center gap-3 hover:border-indigo-500/30 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">Generate AI Quiz</p>
                  <p className="text-xs text-gray-600">Test your knowledge</p>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
              </Link>

              <Link to="/courses"
                className="card p-4 flex items-center gap-3 hover:border-violet-500/30 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">Explore Courses</p>
                  <p className="text-xs text-gray-600">Find new topics</p>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Leaderboard */}
          {leaderboard?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-lg text-white">Leaderboard</h2>
                <Trophy size={16} className="text-yellow-400" />
              </div>
              <div className="card overflow-hidden">
                {leaderboard.slice(0, 5).map((leader, i) => (
                  <div key={leader._id}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 ${leader._id === user?._id ? "bg-violet-500/[0.06]" : ""}`}>
                    <span className={`w-5 text-xs font-bold text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-400" : "text-gray-600"}`}>
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                      {leader.avatar?.url ? <img src={leader.avatar.url} alt="" className="w-full h-full object-cover" /> : leader.name?.charAt(0)}
                    </div>
                    <span className="flex-1 text-sm text-gray-300 truncate font-medium">{leader.name}</span>
                    <div className="flex items-center gap-1 text-xs text-violet-400 font-bold">
                      <Zap size={10} />{leader.xp}
                    </div>
                  </div>
                ))}
                {myRank >= 5 && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/[0.06] border-t border-violet-500/20">
                    <span className="w-5 text-xs font-bold text-center text-gray-400">#{myRank + 1}</span>
                    <span className="flex-1 text-sm text-violet-300 font-medium">You</span>
                    <div className="flex items-center gap-1 text-xs text-violet-400 font-bold">
                      <Zap size={10} />{user?.xp || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Quiz Results */}
          {quizResults?.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-lg text-white mb-3">Recent Quizzes</h2>
              <div className="space-y-2">
                {quizResults.slice(0, 3).map((r) => (
                  <div key={r.quizId} className="glass-sm p-3">
                    <p className="text-sm text-white font-medium truncate">{r.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Star size={12} className={r.bestScore >= 60 ? "text-yellow-400" : "text-gray-600"} />
                        <span className={`text-xs font-bold ${r.bestScore >= 60 ? "text-green-400" : "text-red-400"}`}>
                          {r.bestScore}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">{r.totalAttempts} attempt{r.totalAttempts !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
