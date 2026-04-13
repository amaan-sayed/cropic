import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api", // backend URL
});

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await API.post("/auth/login", data);
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const res = await API.post("/auth/register", data);
    return res.data;
  },
};