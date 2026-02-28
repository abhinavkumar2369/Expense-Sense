/**
 * Sidebar Navigation
 * ===================
 * Responsive sidebar for the dashboard layout.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  Activity,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/fraud-alerts", label: "Fraud Alerts", icon: ShieldAlert },
  { href: "/dashboard/activity", label: "Activity Log", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ADMIN_ITEMS = [
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const allItems = user?.role === "admin" ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gray-900 text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight">
            💰 Expense Sense
          </h1>
          <p className="text-xs text-gray-400 mt-1">AI-Powered Finance</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {allItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
