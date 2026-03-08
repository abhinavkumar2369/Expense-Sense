import { useCallback, useEffect, useState } from "react";
import { fetchExpenses } from "../services/expenseService";

export const useExpenses = (initialFilters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses(filters);
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return { expenses, loading, filters, setFilters, refresh: loadExpenses };
};
