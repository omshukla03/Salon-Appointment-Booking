// src/components/PaymentButton.jsx

import React, { useState } from "react";
import { createPayment } from "../services/paymentService";

const PaymentButton = ({ booking, paymentMethod = "RAZORPAY", onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!booking) {
      alert("No booking data provided!");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🚀 Starting payment process...");
      console.log("Booking data:", booking);
      console.log("Payment method:", paymentMethod);

      // Ensure booking has required fields
      const bookingData = {
        id: booking.id,
        salonId: booking.salonId,
        customerId: booking.customerId || 1, // fallback customer ID
        startTime: booking.startTime,
        endTime: booking.endTime,
        serviceIds: booking.serviceIds || [],
        totalPrice: booking.totalPrice || booking.price || 500 // fallback price
      };

      const result = await createPayment(bookingData, paymentMethod);
      console.log("💳 Payment Response:", result);

      if (result.paymentUrl) {
        // Open payment link in new tab
        window.open(result.paymentUrl, "_blank");
        
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error("Payment URL not found in response");
      }
      
    } catch (error) {
      console.error("❌ Payment Error:", error);
      
      let errorMessage = "Failed to start payment.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        loading
          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
      }`}
      onClick={handlePayment}
      disabled={loading || !booking}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Processing...
        </div>
      ) : (
        `Pay with ${paymentMethod}`
      )}
    </button>
  );
};

export default PaymentButton;