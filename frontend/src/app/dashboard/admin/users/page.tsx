/**
 * Admin – Manage Users Page
 * ==========================
 * Admin-only page to view and manage users.
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { APIResponse } from "@/types";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { Users, Shield, ShieldOff } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function load() {
      try {
        const res = await api.get<APIResponse<{ items: AdminUser[]; total: number }>>("/admin/users", {
          params: { limit: 100 },
        });
        setUsers(res.data.data.items);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, router]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await api.patch(`/admin/users/${userId}/role?role=${newRole}`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-indigo-500" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 transition"
                      title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                    >
                      {u.role === "admin" ? <ShieldOff size={12} /> : <Shield size={12} />}
                      {u.role === "admin" ? "Demote" : "Promote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
