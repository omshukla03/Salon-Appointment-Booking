// src/services/api.js - Fixed version
import axios from "axios";

// Create the main API instance for auth service
const API = axios.create({
  baseURL: "http://localhost:5001", // Remove /api from here since endpoints include it
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create additional API instances for other services
export const salonAPI = axios.create({
  baseURL: "http://localhost:5002/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const bookingAPI = axios.create({
  baseURL: "http://localhost:5005/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const paymentAPI = axios.create({
  baseURL: "http://localhost:5006/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log("🔗 API Request:", config.method?.toUpperCase(), config.url, config.data);
      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    }
  );
};

// Response interceptor for error handling
const addResponseInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => {
      console.log("✅ API Response:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ API Error:", error.response?.status, error.config?.url, error.response?.data);
      
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/partner/login") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to all API instances
[API, salonAPI, bookingAPI, paymentAPI].forEach(api => {
  addAuthInterceptor(api);
  addResponseInterceptor(api);
});

export default API;