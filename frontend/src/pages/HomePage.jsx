import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, ArrowRight, Star, Users, BookOpen, Zap, Brain,
  Shield, TrendingUp, Play, ChevronRight, Award, GraduationCap
} from "lucide-react";
import api from "../utils/api";

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="card p-6 hover:border-white/[0.12] transition-all duration-300 group">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-display font-semibold text-white text-base mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CourseMiniCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="card-hover flex gap-4 p-4">
      <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0d14]">
        {course.thumbnail?.url
          ? <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-violet-500/10 flex items-center justify-center"><BookOpen size={18} className="text-violet-400/30" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm line-clamp-2 leading-snug mb-1">{course.title}</p>
        <p className="text-xs text-gray-600">{course.instructor?.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-400">{course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}</span>
          <span className="text-xs text-gray-700">•</span>
          <span className="text-xs font-semibold text-violet-400">{course.isFree ? "Free" : `₹${course.price}`}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { data: coursesData } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: () => api.get("/courses", { params: { sort: "-enrolledStudents", limit: 6 } }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { value: "10K+", label: "Students" },
    { value: "200+", label: "Courses" },
    { value: "50+", label: "Instructors" },
    { value: "95%", label: "Satisfaction" },
  ];

  const features = [
    { icon: Brain, title: "AI-Powered Learning", desc: "Generate custom quizzes, get personalized recommendations, and chat with our AI study assistant.", color: "from-violet-500 to-purple-700" },
    { icon: TrendingUp, title: "Track Progress", desc: "Visual progress tracking, completion certificates, and gamified achievements keep you motivated.", color: "from-indigo-500 to-blue-700" },
    { icon: Zap, title: "Gamification", desc: "Earn XP, unlock badges, climb the leaderboard, and celebrate every milestone on your journey.", color: "from-orange-500 to-rose-600" },
    { icon: Shield, title: "Expert Instructors", desc: "Learn from verified industry professionals with real-world experience and proven teaching methods.", color: "from-emerald-500 to-green-700" },
    { icon: Play, title: "HD Video Lectures", desc: "Crystal-clear video content with lecture comments, notes, and offline support for uninterrupted learning.", color: "from-pink-500 to-rose-600" },
    { icon: Award, title: "Certificates", desc: "Earn verifiable completion certificates to showcase your skills to employers and on LinkedIn.", color: "from-amber-500 to-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-sm font-medium text-violet-300">AI-Powered Learning Platform</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
            Learn Anything,<br />
            <span className="gradient-text">Anytime, Faster</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Master in-demand skills with AI-curated courses, personalized quizzes, and a gamified learning experience that keeps you coming back.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/courses" className="btn-primary btn-lg gap-2.5 w-full sm:w-auto">
              <BookOpen size={20} /> Explore Courses
            </Link>
            <Link to="/register" className="btn-secondary btn-lg gap-2.5 w-full sm:w-auto">
              Start Free Today <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="glass p-4 text-center">
                <p className="font-display font-bold text-3xl gradient-text">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {coursesData?.courses?.length > 0 && (
        <section className="py-20 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-violet-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp size={14} /> Trending Now
                </p>
                <h2 className="font-display font-bold text-3xl text-white">Popular Courses</h2>
              </div>
              <Link to="/courses" className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesData.courses.map((course) => <CourseMiniCard key={course._id} course={course} />)}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-medium mb-3">Why LearnKro?</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Everything you need to <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">A modern learning platform built with AI at its core, designed for the way you actually learn.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass p-10 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 glow-violet pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-900/40">
                <GraduationCap size={28} className="text-white" />
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                Start your journey today
              </h2>
              <p className="text-gray-400 mb-8 text-lg">Join thousands of learners already upskilling on LearnKro. Free to start.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary btn-lg">
                  <Sparkles size={18} /> Create Free Account
                </Link>
                <Link to="/courses" className="btn-secondary btn-lg">Browse Courses</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">Learn<span className="gradient-text">Kro</span></span>
          </div>
          <p className="text-xs text-gray-700">© 2025 LearnKro. Built with AI for the next generation of learners.</p>
        </div>
      </footer>
    </div>
  );
}
