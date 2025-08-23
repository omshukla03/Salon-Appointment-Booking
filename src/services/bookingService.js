// src/services/bookingService.js - Unified Booking Service

import axios from "axios";
import { bookingAPI } from "./api";

const BOOKING_API_BASE = "http://localhost:5005/api/bookings";

/* =========================================================================
   🔹 BOOKING SERVICES
   ========================================================================= */

// Create new booking
export const createBooking = async (bookingData) => {
  try {
    console.log("📅 Creating booking:", bookingData);
    const response = await bookingAPI.post("/bookings", bookingData);
    console.log("✅ Booking created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    throw error;
  }
};

// Get all bookings
export const getAllBookings = async () => {
  try {
    console.log("📖 Fetching all bookings...");
    const response = await axios.get(BOOKING_API_BASE);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return [];
  }
};

// Get user bookings
export const getUserBookings = async (userId) => {
  try {
    console.log("📋 Fetching user bookings:", userId);
    const response = await bookingAPI.get(`/bookings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    throw error;
  }
};

// Get salon bookings
export const getSalonBookings = async (salonId) => {
  try {
    console.log("🏪 Fetching salon bookings:", salonId);
    const response = await bookingAPI.get(`/bookings/salon/${salonId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching salon bookings:", error);
    throw error;
  }
};

// Get bookings by salon (raw axios version)
export const getBookingsBySalon = async () => {
  try {
    console.log("🏪 Fetching bookings by salon (raw)...");
    const response = await axios.get(`${BOOKING_API_BASE}/salon`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching salon bookings:", error);
    return [];
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    console.log("🔍 Fetching booking:", bookingId);
    const response = await bookingAPI.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    console.log("🔄 Updating booking status:", { bookingId, status });
    // ✅ Prefer explicit endpoint if available
    const response = await axios.patch(`${BOOKING_API_BASE}/${bookingId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    console.log("❌ Cancelling booking:", bookingId);
    // ✅ Using DELETE for hard cancel
    const response = await axios.delete(`${BOOKING_API_BASE}/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    throw error;
  }
};

// Check booking availability
export const checkAvailability = async (salonId, startTime, endTime) => {
  try {
    console.log("🔍 Checking availability:", { salonId, startTime, endTime });
    const response = await bookingAPI.get(`/bookings/availability`, {
      params: { salonId, startTime, endTime },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error checking availability:", error);
    throw error;
  }
};
