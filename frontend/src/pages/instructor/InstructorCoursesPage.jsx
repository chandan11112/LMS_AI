import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Users, Star, Eye, EyeOff, Trash2, Settings } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function InstructorCoursesPage() {
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.get("/instructor/courses").then((r) => r.data.courses),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(["instructor-courses"]); toast.success("Course deleted"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) deleteMutation.mutate(id);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-7">
        <h1 className="font-display font-bold text-3xl text-white">My Courses</h1>
        <Link to="/instructor/courses/create" className="btn-primary btn-sm"><Plus size={15} /> Create Course</Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-20" />)}</div>
      ) : courses?.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course._id} className="card p-5 flex items-center gap-4 hover:border-white/[0.12] transition-all">
              <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0d14]">
                {course.thumbnail?.url
                  ? <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-violet-500/10"><BookOpen size={16} className="text-violet-400/30" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{course.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Users size={10} /> {course.enrolledStudents?.length || 0} students</span>
                  <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" /> {course.averageRating?.toFixed(1) || "New"}</span>
                  <span className={`badge text-xs ${course.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/instructor/courses/${course._id}/manage`} className="btn-secondary btn-sm">
                  <Settings size={13} /> Manage
                </Link>
                <button onClick={() => handleDelete(course._id, course.title)} className="btn-danger btn-sm px-2.5">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-violet-400/20 mx-auto mb-4" />
          <p className="text-gray-500 mb-5">No courses yet</p>
          <Link to="/instructor/courses/create" className="btn-primary"><Plus size={15} /> Create First Course</Link>
        </div>
      )}
    </div>
  );
}
