import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Trash2, Eye, EyeOff } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get("/admin/courses").then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(["admin-courses"]); toast.success("Course deleted"); },
  });

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-white mb-7">All Courses</h1>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {data?.courses?.map((c) => (
            <div key={c._id} className="card p-4 flex items-center gap-4">
              <div className="w-14 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0d14]">
                {c.thumbnail?.url ? <img src={c.thumbnail.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-violet-400/20" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{c.title}</p>
                <p className="text-xs text-gray-600">{c.instructor?.name} • {c.enrolledStudents?.length || 0} students</p>
              </div>
              <span className={`badge text-xs ${c.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                {c.isPublished ? "Published" : "Draft"}
              </span>
              <button onClick={() => { if (window.confirm("Delete this course?")) deleteMutation.mutate(c._id); }} className="btn-danger btn-sm px-2.5">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
