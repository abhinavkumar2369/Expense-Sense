import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="md:flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl text-ink">Welcome, {user?.name}</h2>
            <p className="text-slate-600">Track smarter. Spend wiser.</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50"
          >
            Logout
          </button>
        </header>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
