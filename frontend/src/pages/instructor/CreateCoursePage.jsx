import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Upload, Loader2, ChevronRight, BookOpen, DollarSign, Tag, X, Plus } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Web Development","Mobile Development","Data Science","Machine Learning",
  "Design","Business","Marketing","Photography","Music","Cybersecurity","Cloud Computing","Other",
];
const LEVELS = ["Beginner","Intermediate","Advanced"];
const LANGUAGES = ["English","Hindi","Spanish","French","German","Japanese","Chinese"];

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", level: "Beginner",
    price: "", isFree: false, language: "English",
    tags: [], requirements: [], learningOutcomes: [],
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (fd) => api.post("/courses", fd, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: ({ data }) => {
      toast.success("Course created! Now add your content.");
      navigate(`/instructor/courses/${data.course._id}/manage`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create course"),
  });

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    setThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const addItem = (key, val, setVal) => {
    if (!val.trim()) return;
    setForm((prev) => ({ ...prev, [key]: [...prev[key], val.trim()] }));
    setVal("");
  };
  const removeItem = (key, idx) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      return toast.error("Title, description, and category are required");
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    if (thumbnail) fd.append("thumbnail", thumbnail);
    createMutation.mutate(fd);
  };

  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="input-label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Create New Course</h1>
        <p className="text-gray-500 mt-1">Fill in the details to launch your course</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2"><BookOpen size={16} className="text-violet-400" /> Basic Information</h2>

         
            <input label="Title" required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g Cousrse Title" className="input" maxLength={100} />
            <p className="text-xs text-gray-700 mt-1">{form.title.length}/100</p>
           

             <textarea  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what students will learn, who it's for, and why it's valuable..."
              rows={4} className="input resize-none" maxLength={5000} />
            <p className="text-xs text-gray-700 mt-1">{form.description.length}/5000</p>
          

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" required>
              <select style={{backgroundColor: "black"}} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                <option  value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Level">
              <select style={{backgroundColor: "black"}} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Language">
            <select style={{backgroundColor: "black"}} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="input">
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        {/* Thumbnail */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><Upload size={16} className="text-violet-400" /> Course Thumbnail</h2>
          <label className="cursor-pointer block">
            <input type="file" accept="image/*" onChange={handleThumb} className="hidden" />
            {thumbPreview ? (
              <div className="relative group rounded-xl overflow-hidden h-44 border border-white/[0.08]">
                <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Click to change</p>
                </div>
              </div>
            ) : (
              <div className="h-44 border-2 border-dashed border-white/[0.1] rounded-xl flex flex-col items-center justify-center hover:border-violet-500/40 hover:bg-violet-500/[0.03] transition-all">
                <Upload size={24} className="text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                <p className="text-xs text-gray-700 mt-1">PNG, JPG up to 5MB • Recommended: 1280×720</p>
              </div>
            )}
          </label>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><DollarSign size={16} className="text-violet-400" /> Pricing</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-6 rounded-full transition-all relative ${form.isFree ? "bg-violet-600" : "bg-white/[0.1]"}`}
              onClick={() => setForm({ ...form, isFree: !form.isFree })}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isFree ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm text-gray-300 font-medium">Free Course</span>
          </label>
          {!form.isFree && (
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00" min="0" step="0.01" className="input pl-8" />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><Tag size={16} className="text-violet-400" /> Tags & Metadata</h2>

          {[
            { key: "tags", label: "Tags", input: tagInput, setInput: setTagInput, placeholder: "e.g. React, JavaScript" },
            { key: "requirements", label: "Requirements", input: reqInput, setInput: setReqInput, placeholder: "e.g. Basic HTML knowledge" },
            { key: "learningOutcomes", label: "Learning Outcomes", input: outcomeInput, setInput: setOutcomeInput, placeholder: "e.g. Build full-stack apps" },
          ].map(({ key, label, input, setInput, placeholder }) => (
            <div key={key}>
              <label className="input-label">{label}</label>
              <div className="flex gap-2 mb-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder}
                  className="input flex-1 text-sm" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(key, input, setInput); } }} />
                <button type="button" onClick={() => addItem(key, input, setInput)} className="btn-secondary btn-sm px-3">
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form[key].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/[0.12] border border-violet-500/20 text-violet-300 rounded-lg text-sm">
                    {item}
                    <button type="button" onClick={() => removeItem(key, i)} className="text-violet-400/60 hover:text-red-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button type="submit" disabled={createMutation.isPending} className="btn-primary btn-lg w-full">
          {createMutation.isPending
            ? <><Loader2 size={18} className="animate-spin" /> Creating Course...</>
            : <><ChevronRight size={18} /> Create Course & Add Content</>}
        </button>
      </form>
    </div>
  );
}
