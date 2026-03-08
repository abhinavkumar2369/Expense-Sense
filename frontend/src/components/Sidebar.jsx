import { Link, useLocation } from "react-router-dom";
import { Brain, History, LayoutDashboard, PlusCircle, Settings, Wallet } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-expense", label: "Add Expense", icon: PlusCircle },
  { to: "/expenses", label: "History", icon: History },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/insights", label: "AI Insights", icon: Brain },
  { to: "/profile", label: "Profile", icon: Settings }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-full md:w-64 bg-white/90 backdrop-blur-md border-r border-slate-200 p-4 md:min-h-screen">
      <h1 className="font-heading text-2xl text-ink">Expense Sense</h1>
      <p className="text-sm text-slate-600 mb-6">AI Powered Expense Tracker</p>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                active
                  ? "bg-brand-500 text-white shadow-card"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
