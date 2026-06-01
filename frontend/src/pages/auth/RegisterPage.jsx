import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../context/authStore";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email) e.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === "instructor" ? "/instructor" : "/dashboard", { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">Learn<span className="gradient-text">Kro</span></span>
        </Link>

        <div className="mb-7 text-center">
          <h1 className="font-display font-bold text-3xl text-white">Create Account</h1>
          <p className="text-gray-500 mt-2">Join thousands of learners today</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          {[
            { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
            { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="input-label">{label}</label>
              <input type={type} value={form[id]} placeholder={placeholder}
                onChange={(e) => { setForm({ ...form, [id]: e.target.value }); setErrors({ ...errors, [id]: "" }); }}
                className={`input ${errors[id] ? "border-red-500/50" : ""}`} />
              {errors[id] && <p className="text-red-400 text-xs mt-1.5">{errors[id]}</p>}
            </div>
          ))}

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                placeholder="Min 6 characters" className={`input pr-11 ${errors.password ? "border-red-500/50" : ""}`} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
          </div>

          <div>
            <label className="input-label">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: "student", l: "Learn", e: "🎓" }, { v: "instructor", l: "Teach", e: "📚" }].map(({ v, l, e }) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, role: v })}
                  className={`py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                    form.role === v
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                      : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:bg-white/[0.07] hover:text-white"
                  }`}>
                  {e} {l}
                </button>
              ))}
            </div>
            {form.role === "instructor" && (
              <p className="text-xs text-yellow-400/70 mt-2">Instructor accounts require admin approval before publishing courses.</p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : "Create Free Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
