// src/services/authService.js - Fixed version

import API from "./api";

// Register user
export const registerUser = async (data) => {
  try {
    console.log("🚀 Registering user:", data);
    const response = await API.post("/api/users", {
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: "USER"
    });
    console.log("✅ Registration success:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
};

// Register partner (salon owner)
export const registerPartner = async (data) => {
  try {
    console.log("🚀 Registering partner:", data);
    const response = await API.post("/api/users", {
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: data.password,
      phone: data.phone,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      role: "OWNER"
    });
    console.log("✅ Partner registration success:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Partner registration error:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (data) => {
  try {
    console.log("🚀 Logging in user:", { email: data.email });
    const response = await API.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    
    console.log("✅ Login success:", response.data);
    
    // Store token and user data if login is successful
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user || response.data));
    }
    
    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("👋 User logged out");
};