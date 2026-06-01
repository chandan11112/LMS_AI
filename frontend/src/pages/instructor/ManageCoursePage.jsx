import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle, Upload, Eye, EyeOff, Trash2, Loader2,
  ChevronDown, ChevronUp, Play, FileVideo, X, CheckCircle, AlertCircle
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function ManageCoursePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState(null);
  const [newSection, setNewSection] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["instructor-course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.course),
  });

  const publishMutation = useMutation({
    mutationFn: () => api.put(`/instructor/courses/${id}/publish`),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(["instructor-course", id]);
      queryClient.invalidateQueries(["instructor-courses"]);
      toast.success(data.message);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const addSectionMutation = useMutation({
    mutationFn: (title) => api.post(`/courses/${id}/sections`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries(["instructor-course", id]);
      setNewSection("");
      setShowAddSection(false);
      toast.success("Section added!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const addLectureMutation = useMutation({
    mutationFn: ({ sectionId, fd }) =>
      api.post(`/courses/${id}/sections/${sectionId}/lectures`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Could add upload progress state here
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["instructor-course", id]);
      toast.success("Lecture added successfully!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to add lecture"),
  });

  const deleteLectureMutation = useMutation({
    mutationFn: ({ sectionId, lectureId }) =>
      api.delete(`/courses/${id}/sections/${sectionId}/lectures/${lectureId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["instructor-course", id]);
      toast.success("Lecture deleted");
    },
  });

  if (isLoading) return (
    <div className="page-container flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    </div>
  );

  const canPublish = course?.sections?.length > 0 &&
    course.sections.some((s) => s.lectures.length > 0);

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white line-clamp-1">{course?.title}</h1>
          <p className="text-gray-500 mt-1">{course?.category} • {course?.level}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${course?.isPublished ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"}`}>
            {course?.isPublished ? "● Published" : "○ Draft"}
          </span>
          <button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || (!canPublish && !course?.isPublished)}
            title={!canPublish && !course?.isPublished ? "Add at least one lecture to publish" : ""}
            className={`btn btn-sm flex items-center gap-2 ${
              course?.isPublished
                ? "btn-secondary text-yellow-400 border-yellow-500/20"
                : "btn-primary"
            } disabled:opacity-40`}
          >
            {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> :
              course?.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {course?.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Alert if no content */}
      {!canPublish && !course?.isPublished && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/[0.08] border border-yellow-500/20 rounded-xl mb-6">
          <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">Add at least one section and lecture before publishing your course.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Sections", value: course?.sections?.length || 0 },
          { label: "Lectures", value: course?.totalLectures || 0 },
          { label: "Students", value: course?.enrolledStudents?.length || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display font-bold text-2xl text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Curriculum */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-white">Course Curriculum</h2>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="btn-primary btn-sm"
          >
            <PlusCircle className="w-4 h-4" /> Add Section
          </button>
        </div>

        {showAddSection && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="Section title (e.g. Introduction to React)"
              className="input flex-1"
              onKeyDown={(e) => { if (e.key === "Enter" && newSection.trim()) addSectionMutation.mutate(newSection.trim()); }}
              autoFocus
            />
            <button
              onClick={() => addSectionMutation.mutate(newSection.trim())}
              disabled={!newSection.trim() || addSectionMutation.isPending}
              className="btn-primary px-4"
            >
              {addSectionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </button>
            <button onClick={() => setShowAddSection(false)} className="btn-secondary px-3">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="space-y-3">
          {course?.sections?.map((section, i) => (
            <SectionItem
              key={section._id}
              section={section}
              courseId={id}
              isExpanded={expandedSection === i}
              onToggle={() => setExpandedSection(expandedSection === i ? null : i)}
              addLectureMutation={addLectureMutation}
              deleteLectureMutation={deleteLectureMutation}
            />
          ))}

          {!course?.sections?.length && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-violet-400/40" />
              </div>
              <p className="text-gray-500 mb-2">No sections yet</p>
              <p className="text-gray-600 text-sm">Add sections to organize your course content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionItem({ section, courseId, isExpanded, onToggle, addLectureMutation, deleteLectureMutation }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", isPreview: false });
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAdd = () => {
    if (!form.title.trim()) return toast.error("Lecture title is required");
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("isPreview", form.isPreview);
    if (videoFile) fd.append("video", videoFile);
    addLectureMutation.mutate({ sectionId: section._id, fd });
    setForm({ title: "", description: "", isPreview: false });
    setVideoFile(null);
    setUploadProgress(0);
    setShowAdd(false);
  };

  const completedLectures = section.lectures.filter((l) => l.videoUrl).length;

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
        onClick={onToggle}
      >
        <div>
          <p className="font-semibold text-white">{section.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {section.lectures.length} lecture{section.lectures.length !== 1 ? "s" : ""}
            {completedLectures > 0 && <span className="text-violet-400"> • {completedLectures} with video</span>}
          </p>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>

      {isExpanded && (
        <div className="border-t border-white/[0.06]">
          {/* Lectures list */}
          {section.lectures.map((lecture) => (
            <div key={lecture._id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.02] transition-colors">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${lecture.videoUrl ? "bg-violet-500/15" : "bg-white/[0.05]"}`}>
                {lecture.videoUrl ? <FileVideo size={14} className="text-violet-400" /> : <Play size={14} className="text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{lecture.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {lecture.duration > 0 && (
                    <span className="text-xs text-gray-600">{Math.floor(lecture.duration / 60)}m {lecture.duration % 60}s</span>
                  )}
                  {!lecture.videoUrl && (
                    <span className="text-xs text-yellow-500/70">No video</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lecture.isPreview && (
                  <span className="badge bg-violet-500/15 text-violet-400 text-xs border border-violet-500/20">Preview</span>
                )}
                {lecture.videoUrl && <CheckCircle size={14} className="text-green-400" />}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteLectureMutation.mutate({ sectionId: section._id, lectureId: lecture._id }); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400/60 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Add Lecture form */}
          {showAdd ? (
            <div className="p-4 bg-[#0d0d14] space-y-3">
              <input
                type="text"
                placeholder="Lecture title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input text-sm"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input text-sm resize-none"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/mkv"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="hidden"
                  />
                  <span className="flex items-center gap-2 text-sm glass-sm px-3 py-2 hover:bg-white/[0.08] transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-violet-400" />
                    {videoFile ? (
                      <span className="text-violet-300 max-w-[140px] truncate">{videoFile.name}</span>
                    ) : (
                      <span className="text-gray-500">Upload Video</span>
                    )}
                  </span>
                </label>
                {videoFile && (
                  <button type="button" onClick={() => setVideoFile(null)} className="text-gray-600 hover:text-red-400">
                    <X size={14} />
                  </button>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPreview}
                    onChange={(e) => setForm({ ...form, isPreview: e.target.checked })}
                    className="w-3.5 h-3.5 accent-violet-500"
                  />
                  Free Preview
                </label>
              </div>

              {addLectureMutation.isPending && videoFile && (
                <div className="progress-bar">
                  <div className="progress-fill animate-pulse" style={{ width: "60%" }} />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={addLectureMutation.isPending}
                  className="btn-primary btn-sm"
                >
                  {addLectureMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Add Lecture"}
                </button>
                <button onClick={() => setShowAdd(false)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center gap-2 p-3 px-4 text-sm text-gray-600 hover:text-violet-400 hover:bg-white/[0.03] transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add Lecture
            </button>
          )}
        </div>
      )}
    </div>
  );
}
