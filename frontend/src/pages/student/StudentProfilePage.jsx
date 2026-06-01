import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../context/authStore";
import { User, Camera, Loader2, Zap, Flame, Award } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function StudentProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const updateMutation = useMutation({
    mutationFn: (fd) => api.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: ({ data }) => { updateUser(data.user); toast.success("Profile updated!"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);
    if (avatarFile) fd.append("avatar", avatarFile);
    updateMutation.mutate(fd);
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-white mb-7">Profile</h1>
      <div className="max-w-lg">
        <div className="card p-7 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-2xl font-bold text-white">
                {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> :
                  user?.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors shadow-lg">
                <Camera size={13} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-violet-400"><Zap size={11} /> {user?.xp || 0} XP</span>
                {user?.streak > 0 && <span className="flex items-center gap-1 text-xs text-orange-400"><Flame size={11} /> {user.streak} streak</span>}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="input-label">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell something about yourself..." className="input resize-none" maxLength={500} />
            </div>
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary w-full">
              {updateMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </form>

          {/* Badges */}
          {user?.badges?.length > 0 && (
            <div>
              <label className="input-label flex items-center gap-1.5"><Award size={12} /> Badges</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.badges.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 glass-sm rounded-xl text-sm">
                    {b.icon} <span className="text-gray-300">{b.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
