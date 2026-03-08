import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/authService";

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    await refreshProfile();
    setMessage("Profile updated successfully");
    setFormData((prev) => ({ ...prev, password: "" }));
  };

  return (
    <DashboardLayout>
      <form onSubmit={onSubmit} className="max-w-xl rounded-2xl bg-white p-6 shadow-card space-y-4">
        <h2 className="font-heading text-xl">Profile Settings</h2>
        {message && <p className="text-sm text-brand-700">{message}</p>}
        <input
          className="w-full rounded-lg border border-slate-300 p-3"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Name"
        />
        <input
          className="w-full rounded-lg border border-slate-300 p-3"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Email"
          type="email"
        />
        <input
          className="w-full rounded-lg border border-slate-300 p-3"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="New password (optional)"
          type="password"
        />
        <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700">
          Save
        </button>
      </form>
    </DashboardLayout>
  );
};

export default ProfilePage;
