/**
 * Utility helpers
 */

import { clsx, type ClassValue } from "clsx";

/** Merge Tailwind classes (deduplicates via clsx) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a number as USD currency */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Format an ISO date string to locale-friendly string */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Month index (1-12) → short name */
export function monthName(month: number): string {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[month - 1] || "";
}

/** Category → Tailwind colour class mapping */
export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Groceries": "#f59e0b",
  Transportation: "#3b82f6",
  Entertainment: "#8b5cf6",
  Utilities: "#10b981",
  Healthcare: "#ef4444",
  Shopping: "#ec4899",
  Housing: "#6366f1",
  Education: "#14b8a6",
  Income: "#22c55e",
  Uncategorised: "#94a3b8",
};
