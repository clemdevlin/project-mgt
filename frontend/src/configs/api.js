import axios from "axios";

// const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: "https://project-mgt-lyart.vercel.app/api",
  withCredentials: true,
});

export default api;
