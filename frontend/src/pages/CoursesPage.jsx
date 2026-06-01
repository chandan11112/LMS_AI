import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search, Filter, Star, Users, BookOpen, Clock, Zap,
  ChevronDown, X, SlidersHorizontal, Loader2
} from "lucide-react";
import api from "../utils/api";

const CATEGORIES = [
  "All","Web Development","Mobile Development","Data Science","Machine Learning",
  "Design","Business","Marketing","Photography","Music","Cybersecurity","Cloud Computing","Other",
];
const LEVELS = ["All","Beginner","Intermediate","Advanced"];

function CourseCard({ course }) {
  const totalDuration = course.totalDuration
    ? `${Math.floor(course.totalDuration / 3600)}h ${Math.floor((course.totalDuration % 3600) / 60)}m`
    : null;

  return (
    <Link to={`/courses/${course._id}`} className="card-hover flex flex-col group">
      <div className="relative h-44 overflow-hidden rounded-t-2xl bg-[#0d0d14]">
        {course.thumbnail?.url ? (
          <img
            src={course.thumbnail.url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/10 to-purple-500/5">
            <BookOpen className="w-12 h-12 text-violet-400/20" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="badge bg-[#111118]/90 backdrop-blur-sm text-gray-300 border border-white/10 text-xs">
            {course.level}
          </span>
          {course.isFree && (
            <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-xs">Free</span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-violet-400 font-medium truncate">{course.category}</span>
        </div>

        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3 group-hover:text-violet-300 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
            {course.instructor?.avatar?.url
              ? <img src={course.instructor.avatar.url} alt="" className="w-full h-full object-cover" />
              : course.instructor?.name?.charAt(0)}
          </div>
          <span className="text-xs text-gray-500 truncate">{course.instructor?.name}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
          {course.totalLectures > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen size={11} /> {course.totalLectures} lectures
            </span>
          )}
          {totalDuration && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {totalDuration}
            </span>
          )}
          {course.enrolledStudents?.length > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {course.enrolledStudents.length.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-white">
              {course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}
            </span>
            {course.totalRatings > 0 && (
              <span className="text-xs text-gray-600">({course.totalRatings})</span>
            )}
          </div>
          <div>
            {course.isFree ? (
              <span className="font-bold text-green-400 text-sm">Free</span>
            ) : course.price > 0 ? (
              <span className="font-bold text-white text-sm">₹{course.price.toLocaleString()}</span>
            ) : (
              <span className="font-bold text-green-400 text-sm">Free</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/4 rounded" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-1/4 rounded" />
          <div className="skeleton h-3 w-1/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("-createdAt");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(window.__searchTimer);
    window.__searchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["courses", debouncedSearch, category, level, sort],
    queryFn: () =>
      api.get("/courses", {
        params: {
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(category !== "All" && { category }),
          ...(level !== "All" && { level }),
          sort,
          limit: 24,
        },
      }).then((r) => r.data),
    keepPreviousData: true,
  });

  const activeFilters = [
    category !== "All" && { label: category, clear: () => setCategory("All") },
    level !== "All" && { label: level, clear: () => setLevel("All") },
  ].filter(Boolean);

  const sortOptions = [
    { value: "-createdAt", label: "Newest First" },
    { value: "-enrolledStudents", label: "Most Popular" },
    { value: "-averageRating", label: "Top Rated" },
    { value: "price", label: "Price: Low to High" },
    { value: "-price", label: "Price: High to Low" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero search */}
      <div className="bg-gradient-to-b from-violet-950/30 to-transparent border-b border-white/[0.05] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-display font-bold text-4xl text-white text-center mb-3">
            Explore <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-gray-500 text-center mb-8">Discover thousands of courses taught by expert instructors</p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search courses, topics, instructors..."
              className="input pl-12 pr-4 py-3.5 text-base w-full rounded-2xl"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 btn-sm btn ${showFilters ? "btn-primary" : "btn-secondary"}`}
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 bg-violet-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>

          {activeFilters.map(({ label, clear }) => (
            <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/15 border border-violet-500/25 text-violet-300 rounded-xl text-sm">
              {label}
              <button onClick={clear} className="hover:text-white"><X size={12} /></button>
            </span>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {isLoading ? "..." : `${data?.pagination?.total || 0} courses`}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input py-1.5 text-sm w-auto pr-8"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-5 mb-6 animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="input-label mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        category === c
                          ? "bg-violet-600 text-white"
                          : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.09] hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label mb-3 block">Level</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        level === l
                          ? "bg-violet-600 text-white"
                          : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.09] hover:text-white"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : data?.courses?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
            {data.courses.map((course) => <CourseCard key={course._id} course={course} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-violet-400/30" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(""); setDebouncedSearch(""); setCategory("All"); setLevel("All"); }}
              className="btn-outline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
