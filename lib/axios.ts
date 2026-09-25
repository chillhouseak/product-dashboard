import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach authentication token to every request
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
    // Do not log cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    console.error("Request configuration error:", error.message);
    return Promise.reject(error);
  }
);

// Central response/error handling
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // IMPORTANT:
    // AbortController cancellations are expected when the user
    // changes search/page/filter quickly.
    if (
      axios.isCancel(error) ||
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError"
    ) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }

        console.error("Session expired. Please login again.");
      } else if (status === 404) {
        console.error("Resource not found.");
      } else if (status >= 500) {
        console.error("Server error. Please try again later.");
      } else {
        console.error(
          `API error (${status}):`,
          error.response.data?.message || error.message
        );
      }
    } else if (error.request) {
      console.error("No response received from the server.");
    } else {
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;