import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, TrendingUp, Shield } from "lucide-react";
import api from "../../utils/api";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then((r) => r.data),
  });

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-violet-500 to-purple-700" },
    { label: "Total Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "from-indigo-500 to-blue-700" },
    { label: "Enrollments", value: stats?.totalEnrollments || 0, icon: TrendingUp, color: "from-green-500 to-emerald-700" },
    { label: "Pending Approvals", value: stats?.pendingInstructors || 0, icon: Shield, color: "from-orange-500 to-rose-600" },
  ];

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-white mb-7">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
