// src/services/userService.js - Fixed version

import API from "./api";

// Get all users
export const getAllUsers = async () => {
  try {
    console.log("🚀 Fetching all users...");
    const response = await API.get("/api/users");
    console.log("✅ Users fetched:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    console.log(`🚀 Fetching user ${id}...`);
    const response = await API.get(`/api/users/${id}`);
    console.log("✅ User fetched:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    console.log(`🚀 Updating user ${id}:`, userData);
    const response = await API.put(`/api/users/${id}`, userData);
    console.log("✅ User updated:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    console.log(`🚀 Deleting user ${id}...`);
    const response = await API.delete(`/api/users/${id}`);
    console.log("✅ User deleted");
    return response;
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw error;
  }
};