import axios from "axios";

// const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

export default api;
