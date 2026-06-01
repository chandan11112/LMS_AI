import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import api from "../../utils/api";

export default function InstructorStudentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-students"],
    queryFn: () => api.get("/instructor/students").then((r) => r.data),
  });

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-white mb-7">Students</h1>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-16" />)}</div>
      ) : data?.students?.length > 0 ? (
        <div className="card overflow-hidden">
          {data.students.map((s, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                {s.avatar?.url ? <img src={s.avatar.url} alt="" className="w-full h-full object-cover" /> : s.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{s.name}</p>
                <p className="text-xs text-gray-600">{s.email}</p>
              </div>
              <span className="text-xs text-gray-600">{s.enrolledCourseTitle}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-violet-400/20 mx-auto mb-4" />
          <p className="text-gray-500">No students enrolled yet</p>
        </div>
      )}
    </div>
  );
}
