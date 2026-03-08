import api from "./api";

export const fetchExpenses = async (params = {}) => {
  const { data } = await api.get("/expenses", { params });
  return data;
};

export const addExpense = async (payload) => {
  const { data } = await api.post("/expenses", payload);
  return data;
};

export const editExpense = async (id, payload) => {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
};

export const removeExpense = async (id) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};

export const fetchSummary = async () => {
  const { data } = await api.get("/expenses/summary");
  return data;
};
