import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Play, CheckCircle, Clock, BarChart3, Search, Filter } from "lucide-react";
import { useState } from "react";
import api from "../../utils/api";

function CourseCard({ enrollment }) {
  const { course, completionPercentage, isCompleted } = enrollment;
  if (!course) return null;

  const totalDuration = course.totalDuration
    ? `${Math.floor(course.totalDuration / 3600)}h ${Math.floor((course.totalDuration % 3600) / 60)}m`
    : null;

  return (
    <div className="card overflow-hidden flex flex-col group">
      <div className="relative h-40 bg-[#0d0d14] overflow-hidden">
        {course.thumbnail?.url ? (
          <img src={course.thumbnail.url} alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-violet-500/5">
            <BookOpen className="w-10 h-10 text-violet-400/20" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-full backdrop-blur-sm">
            <CheckCircle size={11} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">Completed</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <span className="text-xs text-violet-400 font-medium mb-1.5">{course.category}</span>
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3 flex-1">{course.title}</h3>

        <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
          <span className="flex items-center gap-1"><BarChart3 size={11} /> {course.level}</span>
          {totalDuration && <span className="flex items-center gap-1"><Clock size={11} /> {totalDuration}</span>}
          {course.totalLectures > 0 && <span className="flex items-center gap-1"><BookOpen size={11} /> {course.totalLectures} lectures</span>}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-600">Progress</span>
            <span className={`font-semibold ${isCompleted ? "text-green-400" : "text-violet-400"}`}>
              {completionPercentage}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-violet-500 to-purple-400"}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <Link
          to={`/learn/${course._id}`}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isCompleted
              ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
              : "btn-primary"
          }`}
        >
          <Play size={14} />
          {isCompleted ? "Review Course" : completionPercentage > 0 ? "Continue" : "Start Learning"}
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-40" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-2 w-full rounded mt-4" />
        <div className="skeleton h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | in-progress | completed

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.get("/enrollments/my").then((r) => r.data.enrollments),
  });

  const filtered = enrollments?.filter((e) => {
    if (!e.course) return false;
    const matchSearch = e.course.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "completed" && e.isCompleted) ||
      (filter === "in-progress" && !e.isCompleted);
    return matchSearch && matchFilter;
  });

  const counts = {
    all: enrollments?.length || 0,
    "in-progress": enrollments?.filter((e) => !e.isCompleted).length || 0,
    completed: enrollments?.filter((e) => e.isCompleted).length || 0,
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-7">
        <h1 className="font-display font-bold text-3xl text-white">My Courses</h1>
        <p className="text-gray-500 mt-1">{counts.all} enrolled course{counts.all !== 1 ? "s" : ""}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="input pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.07] rounded-xl p-1">
          {[
            { key: "all", label: "All" },
            { key: "in-progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key
                  ? "bg-violet-600 text-white shadow"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-[10px] ${filter === key ? "text-violet-200" : "text-gray-700"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((e) => <CourseCard key={e._id} enrollment={e} />)}
        </div>
      ) : enrollments?.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-10 h-10 text-violet-400/30" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Browse our catalog and start learning today</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No courses match your search</p>
          <button onClick={() => { setSearch(""); setFilter("all"); }} className="btn-outline btn-sm mt-4">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
