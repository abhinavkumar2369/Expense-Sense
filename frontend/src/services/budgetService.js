import api from "./api";

export const fetchBudgetStatus = async () => {
  const { data } = await api.get("/budgets");
  return data;
};

export const setMonthlyBudget = async (monthlyBudget) => {
  const { data } = await api.post("/budgets", { monthlyBudget });
  return data;
};
