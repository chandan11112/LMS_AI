import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../context/authStore";
import { GraduationCap, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(form.email, form.password);
      const redirect = user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/dashboard";
      navigate(redirect, { replace: true });
    } catch { /* toast handled in store */ }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-violet-950/60 to-[#0a0a0f]">
        <div className="absolute inset-0 glow-violet pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">Learn<span className="gradient-text">Kro</span></span>
        </Link>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
            <Sparkles size={12} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-300">AI-Powered Learning</span>
          </div>
          <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Unlock your potential<br />one lesson at a time
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Join thousands of learners upskilling with AI-powered courses, quizzes, and personalized learning paths.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "10K+", label: "Students" },
              { value: "200+", label: "Courses" },
              { value: "95%", label: "Satisfaction" },
            ].map(({ value, label }) => (
              <div key={label} className="glass-sm p-4 text-center">
                <p className="font-display font-bold text-2xl gradient-text">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-gray-700">© 2025 LearnKro. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">Learn<span className="gradient-text">Kro</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-white">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to continue learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                placeholder="you@example.com"
                className={`input ${errors.email ? "border-red-500/50 focus:border-red-500/70" : ""}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                  placeholder="Enter your password"
                  className={`input pr-11 ${errors.password ? "border-red-500/50 focus:border-red-500/70" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 p-4 glass-sm">
            
            <div className="space-y-1.5">
              {[
                
                
                
              ].map(({ role, email }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ email, password: "demo123" })}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors text-xs text-gray-500 hover:text-gray-300"
                >
                  <span className="text-violet-400 font-medium">{role}:</span> {email}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
