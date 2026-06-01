import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle, XCircle, Users } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/users/${id}/approve`),
    onSuccess: () => { queryClient.invalidateQueries(["admin-users"]); toast.success("Instructor approved!"); },
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban }) => api.put(`/admin/users/${id}/ban`, { ban }),
    onSuccess: () => { queryClient.invalidateQueries(["admin-users"]); toast.success("Updated"); },
  });

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-white mb-7">Users</h1>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["User","Role","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {u.avatar?.url ? <img src={u.avatar.url} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-600">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs capitalize ${
                      u.role === "admin" ? "bg-red-500/15 text-red-400" :
                      u.role === "instructor" ? "bg-green-500/15 text-green-400" : "bg-violet-500/15 text-violet-400"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${u.isBanned ? "bg-red-500/15 text-red-400" : u.isApproved ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                      {u.isBanned ? "Banned" : u.isApproved ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {u.role === "instructor" && !u.isApproved && !u.isBanned && (
                        <button onClick={() => approveMutation.mutate(u._id)} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors">
                          <CheckCircle size={13} /> Approve
                        </button>
                      )}
                      {u.role !== "admin" && (
                        <button onClick={() => banMutation.mutate({ id: u._id, ban: !u.isBanned })}
                          className={`flex items-center gap-1 text-xs transition-colors ${u.isBanned ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}`}>
                          <XCircle size={13} /> {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
