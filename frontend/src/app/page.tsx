/**
 * Landing Page
 * =============
 * Public landing page with hero section and CTA.
 */

"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, ShieldAlert, Brain, CreditCard } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold">💰 Expense Sense</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Smart Expense Tracking
          <br />
          <span className="text-indigo-400">Powered by AI</span>
        </h2>
        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Track your expenses, detect fraud in real-time, predict future spending,
          and gain AI-driven insights — all in one beautiful dashboard.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30"
          >
            Start Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/10 transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: CreditCard,
            title: "Expense Tracking",
            desc: "Full CRUD with automatic AI categorisation.",
          },
          {
            icon: Brain,
            title: "AI Categorisation",
            desc: "TF-IDF + Naive Bayes auto-labels your transactions.",
          },
          {
            icon: ShieldAlert,
            title: "Fraud Detection",
            desc: "Isolation Forest flags anomalous transactions instantly.",
          },
          {
            icon: BarChart3,
            title: "Smart Analytics",
            desc: "Monthly trends, predictions, and category breakdowns.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
          >
            <f.icon className="text-indigo-400 mb-4" size={28} />
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}