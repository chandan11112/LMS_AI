import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// FIX: Import ReactPlayer directly (not lazy) to avoid loading issues with video URLs
import ReactPlayer from "react-player";
import {
  ChevronDown, ChevronUp, CheckCircle, Circle, ArrowLeft,
  PlayCircle, Lock, Loader2, Menu, X, MessageSquare, Send,
  ThumbsUp, Clock, BookOpen, Award, ChevronRight, AlertCircle
} from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";
import toast from "react-hot-toast";

export default function CourseLearnPage() {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeLecture, setActiveLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState([0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [comment, setComment] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(null);
  // FIX: track player ready state to avoid premature playback
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const playerRef = useRef(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course-learn", courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then((r) => r.data.course),
  });

  // FIX: Set first lecture on course load; reset player state when lecture changes
  useEffect(() => {
    if (course && !activeLecture) {
      const first = course.sections?.[0]?.lectures?.[0];
      if (first) {
        setActiveLecture(first);
        setActiveSectionId(course.sections[0]._id);
      }
    }
  }, [course]); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX: Reset player error when lecture changes
  useEffect(() => {
    setPlayerError(null);
    setPlayerReady(false);
  }, [activeLecture?._id]);

  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => api.get(`/enrollments/check/${courseId}`).then((r) => r.data.enrollment),
  });

  const progressMutation = useMutation({
    mutationFn: ({ lectureId, sectionId }) =>
      api.put(`/enrollments/${courseId}/progress`, { lectureId, sectionId, completed: true }),
    onSuccess: () => {
      refetchEnrollment();
      queryClient.invalidateQueries(["my-enrollments"]);
      toast.success("Progress saved!");
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ sectionId, lectureId, text }) =>
      api.post(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/comments`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries(["course-learn", courseId]);
      setComment("");
      toast.success("Comment posted!");
    },
  });

  const toggleSection = useCallback((i) => {
    setExpandedSections((prev) =>
      prev.includes(i) ? prev.filter((s) => s !== i) : [...prev, i]
    );
  }, []);

  // FIX: Use enrollment ref to avoid stale closure in handleVideoEnd
  const enrollmentRef = useRef(enrollment);
  useEffect(() => { enrollmentRef.current = enrollment; }, [enrollment]);

  const isLectureCompleted = useCallback((lectureId) =>
    enrollmentRef.current?.progress?.some((p) => p.lecture === lectureId && p.completed),
    [] // stable — reads from ref
  );

  const handleVideoEnd = useCallback(() => {
    if (activeLecture && activeSectionId && !isLectureCompleted(activeLecture._id)) {
      progressMutation.mutate({ lectureId: activeLecture._id, sectionId: activeSectionId });
    }
  }, [activeLecture, activeSectionId, isLectureCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkComplete = () => {
    if (activeLecture && activeSectionId && !isLectureCompleted(activeLecture._id)) {
      progressMutation.mutate({ lectureId: activeLecture._id, sectionId: activeSectionId });
    }
  };

  const handleLectureSelect = (lecture, sectionId) => {
    setActiveLecture(lecture);
    setActiveSectionId(sectionId);
    setSidebarOpen(false);
  };

  const activeComments = course?.sections
    ?.find((s) => s._id === activeSectionId)
    ?.lectures?.find((l) => l._id === activeLecture?._id)
    ?.comments || [];

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading course...</p>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06]">
        <h2 className="font-semibold text-white text-sm line-clamp-2 leading-snug">{course?.title}</h2>
        {enrollment && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-medium text-violet-400">{enrollment.completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${enrollment.completionPercentage}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              {enrollment.progress?.filter((p) => p.completed).length} / {course?.totalLectures} lectures
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {course?.sections?.map((section, i) => {
          const sectionCompleted = section.lectures.filter((l) => isLectureCompleted(l._id)).length;
          return (
            <div key={section._id} className="border-b border-white/[0.04]">
              <button
                onClick={() => toggleSection(i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className="pr-2 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug truncate">{section.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {sectionCompleted}/{section.lectures.length} completed
                  </p>
                </div>
                {expandedSections.includes(i)
                  ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </button>

              {expandedSections.includes(i) && (
                <div className="pb-2">
                  {section.lectures.map((lecture) => {
                    const isActive = activeLecture?._id === lecture._id;
                    const isDone = isLectureCompleted(lecture._id);
                    return (
                      <button
                        key={lecture._id}
                        onClick={() => handleLectureSelect(lecture, section._id)}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-all ${
                          isActive
                            ? "bg-violet-500/[0.12] border-l-2 border-violet-500"
                            : "hover:bg-white/[0.03] border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : isActive ? (
                            <PlayCircle className="w-4 h-4 text-violet-400" />
                          ) : lecture.videoUrl ? (
                            <Circle className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium line-clamp-2 leading-snug ${
                            isActive ? "text-violet-300" : isDone ? "text-gray-400" : "text-gray-500"
                          }`}>
                            {lecture.title}
                          </p>
                          {lecture.duration > 0 && (
                            <p className="text-xs text-gray-700 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {Math.floor(lecture.duration / 60)}m {lecture.duration % 60}s
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {enrollment?.isCompleted && (
        <div className="p-4 border-t border-white/[0.06]">
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl p-3 text-center">
            <Award className="w-6 h-6 text-violet-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-violet-300">Course Completed!</p>
            <p className="text-xs text-gray-500">Certificate available</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 bg-[#0d0d14] border-r border-white/[0.06]">
        <div className="p-3 border-b border-white/[0.06]">
          <Link
            to="/dashboard/my-courses"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> My Courses
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-80 bg-[#0d0d14] border-r border-white/[0.06] z-10 flex flex-col">
            <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
              <Link to="/dashboard/my-courses" className="flex items-center gap-2 text-sm text-gray-500">
                <ArrowLeft className="w-4 h-4" /> My Courses
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-b border-white/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium text-white truncate px-3">{activeLecture?.title || "Select a lecture"}</p>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Video player */}
          {activeLecture?.videoUrl ? (
            <div className="aspect-video w-full bg-black relative">
              {/* FIX: Use non-lazy ReactPlayer with proper config for Cloudinary URLs */}
              <ReactPlayer
                ref={playerRef}
                key={activeLecture._id}
                url={activeLecture.videoUrl}
                width="100%"
                height="100%"
                controls
                // FIX: Do NOT set playing=true by default — let user click play
                playing={false}
                onReady={() => setPlayerReady(true)}
                onEnded={handleVideoEnd}
                onError={(e) => {
                  console.error("ReactPlayer error:", e);
                  setPlayerError("Video failed to load. Please try again later.");
                }}
                // FIX: Removed forceVideo:true which breaks HLS/Cloudinary URLs
                // Removed controlsList which is HTML5-only and can break non-mp4 streams
                config={{
                  file: {
                    attributes: {
                      // FIX: crossOrigin required for Cloudinary CORS
                      crossOrigin: "anonymous",
                    },
                    // FIX: Let ReactPlayer auto-detect HLS vs mp4 — don't force video type
                    forceVideo: false,
                    forceHLS: activeLecture.videoUrl?.includes(".m3u8"),
                  },
                }}
              />
              {/* Loading overlay while player initializes */}
              {!playerReady && !playerError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                </div>
              )}
              {/* Error overlay */}
              {playerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <p className="text-red-300 text-sm text-center px-4">{playerError}</p>
                  <button
                    onClick={() => setPlayerError(null)}
                    className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video w-full bg-[#0d0d14] flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-3 text-gray-700" />
                <p className="text-gray-600">
                  {activeLecture ? "No video for this lecture" : "Select a lecture to begin"}
                </p>
              </div>
            </div>
          )}

          {/* Lecture info + tabs */}
          {activeLecture && (
            <div className="max-w-4xl p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                <span>{course?.sections?.find((s) => s._id === activeSectionId)?.title}</span>
                <ChevronRight size={12} />
                <span className="text-gray-400">{activeLecture.title}</span>
              </div>

              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="font-display font-bold text-2xl text-white leading-tight">{activeLecture.title}</h1>
                <button
                  onClick={handleMarkComplete}
                  disabled={progressMutation.isPending || isLectureCompleted(activeLecture._id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isLectureCompleted(activeLecture._id)
                      ? "bg-green-500/15 text-green-400 border border-green-500/25 cursor-default"
                      : "btn-outline"
                  }`}
                >
                  {progressMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  {isLectureCompleted(activeLecture._id) ? "Completed" : "Mark Complete"}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-white/[0.06] mb-6">
                {["overview", "comments"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-violet-500 text-violet-400"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab}
                    {tab === "comments" && activeComments.length > 0 && (
                      <span className="ml-1.5 text-xs bg-white/[0.08] px-1.5 py-0.5 rounded-full">
                        {activeComments.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div>
                  {activeLecture.description ? (
                    <p className="text-gray-400 leading-relaxed">{activeLecture.description}</p>
                  ) : (
                    <p className="text-gray-600 italic">No description provided for this lecture.</p>
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div>
                  {/* Post comment */}
                  <div className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="input flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && comment.trim()) {
                            commentMutation.mutate({ sectionId: activeSectionId, lectureId: activeLecture._id, text: comment });
                          }
                        }}
                      />
                      <button
                        onClick={() => commentMutation.mutate({ sectionId: activeSectionId, lectureId: activeLecture._id, text: comment })}
                        disabled={!comment.trim() || commentMutation.isPending}
                        className="btn-primary btn-sm px-3"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-4">
                    {activeComments.length > 0 ? activeComments.map((c, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                          {c.user?.avatar?.url ? (
                            <img src={c.user.avatar.url} alt="" className="w-full h-full object-cover" />
                          ) : c.user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{c.user?.name || "User"}</span>
                            <span className="text-xs text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No comments yet. Start the discussion!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
