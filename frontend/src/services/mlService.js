import api from "./api";

export const fetchInsights = async () => {
  const { data } = await api.get("/ml/insights");
  return data;
};
