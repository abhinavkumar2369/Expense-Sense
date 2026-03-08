import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="font-heading text-3xl mb-2">Create Account</h1>
        <p className="mb-6 text-slate-600">Start tracking your expenses with AI</p>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-3"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-3"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white hover:bg-brand-700"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already registered? <Link to="/login" className="text-brand-700 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
