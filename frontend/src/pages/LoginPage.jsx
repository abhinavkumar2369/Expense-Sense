import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { loginUser, loading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loginUser(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="font-heading text-3xl mb-2">Expense Sense</h1>
        <p className="mb-6 text-slate-600">Sign in to continue</p>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
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
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white hover:bg-brand-700"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          No account? <Link to="/register" className="text-brand-700 font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
