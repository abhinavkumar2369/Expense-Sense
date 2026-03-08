import api from "./api";

export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/profile");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put("/profile", payload);
  return data;
};
