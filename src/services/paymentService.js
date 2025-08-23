// src/services/paymentService.js - FIXED VERSION

import { paymentAPI } from "./api";
import { getCurrentSalonId, makeAuthenticatedRequest } from "../utils/authUtils";

/**
 * Get all payments for a specific salon
 * @param {string} salonId - The salon ID
 * @returns {Promise<Array>} Array of payments
 */
export const getPaymentsBySalon = async (salonId) => {
  try {
    console.log("🔍 Fetching payments for salon:", salonId);
    
    if (!salonId) {
      throw new Error("Salon ID is required");
    }

    // Use the authenticated request utility
    const response = await makeAuthenticatedRequest(
      `http://localhost:5006/api/payments/salon/${salonId}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch payments: ${response.status}`);
    }

    console.log("✅ Payments fetched successfully:", data);
    return data;

  } catch (error) {
    console.error("❌ Error in getPaymentsBySalon:", error);
    throw error;
  }
};

/**
 * Get payment details by payment ID (with salon validation)
 * @param {string} paymentId - The payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentById = async (paymentId) => {
  try {
    const salonId = getCurrentSalonId();
    if (!salonId) {
      throw new Error("Salon authentication required");
    }

    const response = await makeAuthenticatedRequest(
      `http://localhost:5006/api/payments/${paymentId}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch payment: ${response.status}`);
    }

    // Validate that this payment belongs to the current salon
    if (data.salonId !== salonId) {
      throw new Error("Payment not found for your salon");
    }

    return data;

  } catch (error) {
    console.error("❌ Error in getPaymentById:", error);
    throw error;
  }
};

/**
 * Process a payment for a booking
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Payment result
 */
export const processPayment = async (paymentData) => {
  try {
    const salonId = getCurrentSalonId();
    if (!salonId) {
      throw new Error("Salon authentication required");
    }

    // Ensure salon ID is included in payment data
    const payload = {
      ...paymentData,
      salonId: salonId
    };

    console.log("💳 Processing payment:", payload);

    const response = await makeAuthenticatedRequest(
      "http://localhost:5006/api/payments/process",
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Payment processing failed: ${response.status}`);
    }

    console.log("✅ Payment processed successfully:", data);
    return data;

  } catch (error) {
    console.error("❌ Error in processPayment:", error);
    throw error;
  }
};

/**
 * Get payment statistics for current salon
 * @returns {Promise<Object>} Payment statistics
 */
export const getPaymentStats = async () => {
  try {
    const salonId = getCurrentSalonId();
    if (!salonId) {
      throw new Error("Salon authentication required");
    }

    const response = await makeAuthenticatedRequest(
      `http://localhost:5006/api/payments/stats/salon/${salonId}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch stats: ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error("❌ Error in getPaymentStats:", error);
    throw error;
  }
};

/**
 * Update payment status (for salon owners)
 * @param {string} paymentId - Payment ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated payment
 */
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const salonId = getCurrentSalonId();
    if (!salonId) {
      throw new Error("Salon authentication required");
    }

    const response = await makeAuthenticatedRequest(
      `http://localhost:5006/api/payments/${paymentId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, salonId })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to update payment: ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error("❌ Error in updatePaymentStatus:", error);
    throw error;
  }
};