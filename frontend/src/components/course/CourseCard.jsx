import { Link } from "react-router-dom";
import { Star, Users, Clock, BookOpen, Play } from "lucide-react";

export default function CourseCard({ course }) {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const levelColors = {
    Beginner: "bg-green-500/20 text-green-400",
    Intermediate: "bg-yellow-500/20 text-yellow-400",
    Advanced: "bg-red-500/20 text-red-400",
  };

  return (
    <Link to={`/courses/${course._id}`} className="card-hover group block">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-dark-900">
        {course.thumbnail?.url ? (
          <img
            src={course.thumbnail.url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/50 to-dark-800">
            <BookOpen className="w-12 h-12 text-primary-400/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        {course.isFree && (
          <span className="absolute top-3 left-3 badge bg-green-500/90 text-white text-xs font-bold">FREE</span>
        )}
        <span className={`absolute top-3 right-3 badge ${levelColors[course.level] || "bg-gray-500/20 text-gray-400"}`}>
          {course.level}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-primary-400 font-medium mb-1.5">{course.category}</p>
        <h3 className="font-semibold text-white text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center gap-2 mb-3">
            {course.instructor.avatar?.url ? (
              <img src={course.instructor.avatar.url} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {course.instructor.name?.charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-500">{course.instructor.name}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 font-medium">{course.averageRating?.toFixed(1) || "New"}</span>
            {course.totalRatings > 0 && <span>({course.totalRatings})</span>}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.enrolledStudents?.length || 0}
          </span>
          {course.totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(course.totalDuration)}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="font-bold text-white">
            {course.isFree || course.price === 0 ? (
              <span className="text-green-400">Free</span>
            ) : (
              `₹${course.price}`
            )}
          </span>
          <span className="text-xs text-gray-600">{course.totalLectures || 0} lectures</span>
        </div>
      </div>
    </Link>
  );
}
