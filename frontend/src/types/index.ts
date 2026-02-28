/**
 * Shared TypeScript types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  is_flagged: boolean;
  fraud_score: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  description: string;
  category?: string;
  note?: string;
}

export interface TransactionUpdate {
  amount?: number;
  description?: string;
  category?: string;
  note?: string;
}

export interface AnalyticsSummary {
  total_spending: number;
  monthly_spending: number;
  transaction_count: number;
  flagged_count: number;
  category_breakdown: Record<string, number>;
  monthly_trend: { year: number; month: number; total: number; count: number }[];
}

export interface PredictionResult {
  predicted_spending: number | null;
  confidence: number | null;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}
