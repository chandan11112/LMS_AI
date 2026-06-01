import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Users, Star, TrendingUp, Plus, ChevronRight, Eye, DollarSign } from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";

export default function InstructorDashboard() {
  const { user } = useAuthStore();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.get("/instructor/courses").then((r) => r.data.courses),
  });

  const totalStudents = courses?.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0) || 0;
  const publishedCourses = courses?.filter((c) => c.isPublished).length || 0;
  const avgRating = courses?.length
    ? (courses.reduce((acc, c) => acc + (c.averageRating || 0), 0) / courses.length).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Total Courses", value: courses?.length || 0, icon: BookOpen, color: "from-violet-500 to-purple-700" },
    { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "from-indigo-500 to-blue-700" },
    { label: "Published", value: publishedCourses, icon: Eye, color: "from-green-500 to-emerald-700" },
    { label: "Avg Rating", value: avgRating, icon: Star, color: "from-yellow-500 to-orange-600" },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Welcome, <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Manage your courses and track performance</p>
        </div>
        <Link to="/instructor/courses/create" className="btn-primary btn-sm">
          <Plus size={15} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-white leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course list */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-xl text-white">Your Courses</h2>
          <Link to="/instructor/courses" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 flex items-center gap-4">
                <div className="skeleton w-16 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : courses?.length > 0 ? (
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div key={course._id} className="card p-5 flex items-center gap-4 hover:border-white/[0.12] transition-all">
                <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0d14]">
                  {course.thumbnail?.url
                    ? <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center bg-violet-500/10">
                        <BookOpen size={16} className="text-violet-400/30" />
                      </div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Users size={10} /> {course.enrolledStudents?.length || 0}</span>
                    <span className="flex items-center gap-1"><Star size={10} /> {course.averageRating?.toFixed(1) || "New"}</span>
                    <span className={`badge text-xs ${course.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/instructor/courses/${course._id}/manage`}
                  className="btn-secondary btn-sm flex-shrink-0"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-violet-400/30" />
            </div>
            <p className="text-gray-500 mb-5">No courses yet. Create your first one!</p>
            <Link to="/instructor/courses/create" className="btn-primary">
              <Plus size={16} /> Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
