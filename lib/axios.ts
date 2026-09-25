import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add authentication token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized response error handling
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
      }

      if (status === 404) {
        console.error("Resource not found.");
      }

      if (status >= 500) {
        console.error(
          "Server error. Please try again later."
        );
      }
    } else if (error.request) {
      console.error(
        "No response received from the server."
      );
    } else {
      console.error(
        "Request configuration error:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;