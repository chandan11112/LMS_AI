import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Star, Users, Clock, BookOpen, Globe, CheckCircle, Play, Lock,
  ChevronDown, ChevronUp, Loader2, ArrowLeft, Award, BarChart3
} from "lucide-react";
import { useState } from "react";
import api from "../utils/api";
import { useAuthStore } from "../context/authStore";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState([0]);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.course),
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-check", id],
    queryFn: () => api.get(`/enrollments/check/${id}`).then((r) => r.data),
    enabled: !!token && !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post(`/enrollments/${id}/enroll`),
    onSuccess: () => {
      toast.success("Enrolled successfully! 🎉");
      navigate(`/learn/${id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Enrollment failed"),
  });

  const handleEnroll = () => {
    if (!token) { navigate("/login"); return; }
    if (user.role !== "student") { toast.error("Only students can enroll"); return; }
    enrollMutation.mutate();
  };

  const toggleSection = (i) => {
    setExpandedSections((prev) =>
      prev.includes(i) ? prev.filter((s) => s !== i) : [...prev, i]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Course not found</p>
        <button onClick={() => navigate("/courses")} className="btn-outline">Back to Courses</button>
      </div>
    );
  }

  const isEnrolled = enrollment?.isEnrolled;
  const totalDuration = course.sections?.reduce(
    (acc, s) => acc + s.lectures.reduce((a, l) => a + (l.duration || 0), 0), 0
  ) || 0;
  const totalHours = `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0d0d18] to-[#0a0a0f] border-b border-white/[0.05] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft size={16} /> Back to Courses
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-violet-500/15 text-violet-400 border border-violet-500/25">{course.category}</span>
                <span className="badge bg-white/[0.06] text-gray-400 border border-white/[0.08]">{course.level}</span>
                {course.isFree && <span className="badge bg-green-500/15 text-green-400 border border-green-500/25">Free</span>}
              </div>

              <h1 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight mb-4">{course.title}</h1>
              <p className="text-gray-400 leading-relaxed mb-6 line-clamp-3">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white">{course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}</span>
                  {course.totalRatings > 0 && <span>({course.totalRatings} ratings)</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>{course.totalLectures || 0} lectures</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{totalHours}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Globe size={14} />
                  <span>{course.language || "English"}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {course.instructor?.avatar?.url
                    ? <img src={course.instructor.avatar.url} alt="" className="w-full h-full object-cover" />
                    : course.instructor?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-600">Instructor</p>
                  <p className="text-sm font-semibold text-white">{course.instructor?.name}</p>
                </div>
              </div>
            </div>

            {/* Enrollment card */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-20">
                {course.thumbnail?.url && (
                  <div className="h-40 rounded-xl overflow-hidden mb-5 bg-[#0d0d14]">
                    <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mb-5">
                  {course.isFree || course.price === 0 ? (
                    <p className="font-display font-bold text-3xl text-green-400">Free</p>
                  ) : (
                    <p className="font-display font-bold text-3xl text-white">₹{course.price?.toLocaleString()}</p>
                  )}
                </div>

                {isEnrolled ? (
                  <button onClick={() => navigate(`/learn/${id}`)} className="btn-primary w-full btn-lg mb-4">
                    <Play size={18} /> Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    className="btn-primary w-full btn-lg mb-4"
                  >
                    {enrollMutation.isPending
                      ? <><Loader2 size={18} className="animate-spin" /> Enrolling...</>
                      : course.isFree || course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                  </button>
                )}

                <div className="space-y-2.5 text-sm text-gray-500">
                  {[
                    { icon: BookOpen, text: `${course.totalLectures || 0} lectures` },
                    { icon: Clock, text: totalDuration > 0 ? totalHours + " of content" : "Self-paced" },
                    { icon: Award, text: "Certificate of completion" },
                    { icon: BarChart3, text: `${course.level} level` },
                    { icon: Globe, text: course.language || "English" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={14} className="text-violet-400 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Learning outcomes */}
            {course.learningOutcomes?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-5">What you'll learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400">{outcome}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="text-violet-500 mt-1 flex-shrink-0">•</span> {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Curriculum */}
            {course.sections?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-5">Course Curriculum</h2>
                <div className="space-y-2">
                  {course.sections.map((section, i) => (
                    <div key={section._id} className="card overflow-hidden">
                      <button
                        onClick={() => toggleSection(i)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-semibold text-white text-sm">{section.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{section.lectures.length} lecture{section.lectures.length !== 1 ? "s" : ""}</p>
                        </div>
                        {expandedSections.includes(i) ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </button>

                      {expandedSections.includes(i) && (
                        <div className="border-t border-white/[0.05]">
                          {section.lectures.map((lecture) => (
                            <div key={lecture._id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                              {lecture.isPreview || isEnrolled
                                ? <Play size={14} className="text-violet-400 flex-shrink-0" />
                                : <Lock size={14} className="text-gray-600 flex-shrink-0" />}
                              <span className={`flex-1 text-sm ${lecture.isPreview || isEnrolled ? "text-gray-300" : "text-gray-600"} truncate`}>
                                {lecture.title}
                              </span>
                              {lecture.isPreview && <span className="badge bg-violet-500/15 text-violet-400 text-xs border border-violet-500/20">Preview</span>}
                              {lecture.duration > 0 && (
                                <span className="text-xs text-gray-600 flex-shrink-0 ml-2">
                                  {Math.floor(lecture.duration / 60)}m
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {course.ratings?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-5">Reviews</h2>
                <div className="space-y-4">
                  {course.ratings.slice(0, 5).map((rating, i) => (
                    <div key={i} className="card p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
                          {rating.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{rating.user?.name || "Student"}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array(5).fill(0).map((_, j) => (
                              <Star key={j} size={11} className={j < rating.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {rating.review && <p className="text-sm text-gray-400 leading-relaxed">{rating.review}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
