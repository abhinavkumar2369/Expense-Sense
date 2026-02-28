/**
 * Settings Page
 * ==============
 * Update user profile information.
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Settings, User, Mail, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/me", { name, email });
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.name = name;
      stored.email = email;
      localStorage.setItem("user", JSON.stringify(stored));
      toast.success("Profile updated");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/me", { password: newPassword });
      setNewPassword("");
      toast.success("Password changed");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="text-indigo-500" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Information</h3>
        <p className="text-sm text-gray-500 mb-5">Update your name and email address</p>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
        <p className="text-sm text-gray-500 mb-5">Ensure your account stays secure</p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Lock size={14} /> New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Min 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">User ID</span>
            <span className="text-gray-700 font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="capitalize font-medium text-gray-700">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member Since</span>
            <span className="text-gray-700">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
