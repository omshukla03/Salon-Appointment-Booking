// src/pages/PartnerLogin.jsx - Fixed Version

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 ${
        type === "success"
          ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
          : "bg-red-50 border border-red-200 text-red-800"
      }`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === "success" ? (
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-sm">✓</span>
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">✕</span>
            </div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
          <span className="text-lg">&times;</span>
        </button>
      </div>
    </div>
  );
};

function PartnerLogin() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (toast) setToast(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("🚀 Form submitted, preventing default");

    if (!formData.email.trim() || !formData.password.trim()) {
      showToast("Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    const payload = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      console.log("📡 Making login request...");
      const res = await fetch("http://localhost:5002/api/salons/auth/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📨 Response status:", res.status);
      const data = await res.json();
      console.log("🔍 Complete Login Response:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        console.error("❌ Response not OK:", res.status, data.message);
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      // Enhanced ID extraction with detailed logging
      console.log("🔍 Checking for salon ID in these fields:");
      console.log("  - data.salonId:", data.salonId);
      console.log("  - data.salon?.id:", data.salon?.id);
      console.log("  - data.salon?._id:", data.salon?._id);
      console.log("  - data.id:", data.id);
      console.log("  - data._id:", data._id);
      console.log("  - data.ownerId:", data.ownerId);

      // Try multiple possible salon ID locations
      let salonId = data.salonId || 
                   data.salon?.id || 
                   data.salon?._id || 
                   data.id || 
                   data._id;

      // If still no salon ID, check if the response structure is different
      if (!salonId && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          console.log(`  - data.${key}:`, data[key]);
          if (key.toLowerCase().includes('salon') || key.toLowerCase().includes('id')) {
            if (!salonId && data[key] && typeof data[key] === 'string') {
              console.log(`  Found potential salon ID in ${key}:`, data[key]);
              salonId = data[key];
            }
          }
        });
      }

      // Create flexible auth data structure
      const authData = {
        owner: {
          id: data.ownerId || data.owner?.id || data.id || data._id,
          email: data.email || data.owner?.email,
          name: data.name || data.owner?.name || data.ownerName,
        },
        salon: {
          id: salonId,
          name: data.salonName || data.salon?.name || data.name,
          address: data.address || data.salon?.address,
          phoneNumber: data.phoneNumber || data.salon?.phoneNumber,
          city: data.city || data.salon?.city,
          openTime: data.openTime || data.salon?.openTime,
          closeTime: data.closeTime || data.salon?.closeTime,
          images: data.images || data.salon?.images,
        },
        token: data.token || data.accessToken || data.authToken,
        loginTime: new Date().toISOString(),
        rawResponse: data
      };

      console.log("✅ Processed Auth Data:", JSON.stringify(authData, null, 2));

      // If we still don't have a salon ID, use owner ID as fallback
      if (!authData.salon.id) {
        console.warn("⚠️ No salon ID found, but proceeding with available data");
        console.log("Available data keys:", Object.keys(data));
        
        if (authData.owner.id && !authData.salon.id) {
          authData.salon.id = authData.owner.id;
          console.log("ℹ️ Using owner ID as salon ID:", authData.salon.id);
        }
      }

      // Store structured data
      console.log("💾 Storing auth data...");
      localStorage.setItem("partnerAuth", JSON.stringify(authData));
      
      if (authData.salon.id) {
        localStorage.setItem("currentSalonId", authData.salon.id);
        localStorage.setItem("salonId", authData.salon.id);
      }
      
      localStorage.setItem("owner", JSON.stringify(data));

      console.log("✅ Final Stored Data:");
      console.log("  - partnerAuth:", JSON.parse(localStorage.getItem("partnerAuth")));
      console.log("  - currentSalonId:", localStorage.getItem("currentSalonId"));

      console.log("🎉 Login successful, showing toast...");
      showToast("Partner login successful!", "success");

      // Debug: Check if data was stored correctly
      console.log("🔍 Verifying stored data...");
      const storedAuth = JSON.parse(localStorage.getItem("partnerAuth"));
      const storedSalonId = localStorage.getItem("currentSalonId");
      console.log("Stored auth data:", storedAuth);
      console.log("Stored salon ID:", storedSalonId);

      // Wait a moment for the toast to show, then navigate
      console.log("🔀 Preparing to navigate to dashboard...");
      setTimeout(() => {
        console.log("✅ Navigating to dashboard now...");
        navigate("/dashboard", { replace: true });
      }, 1500);

    } catch (err) {
      console.error("❌ Login Error:", err);
      console.error("❌ Error stack:", err.stack);
      
      let errorMessage = "Login failed";
      if (err.message.includes("401")) errorMessage = "Invalid email or password";
      else if (err.message.includes("404")) errorMessage = "Partner not found";
      else if (err.message.includes("Failed to fetch"))
        errorMessage = "Cannot connect to server. Please try again.";
      else if (err.message) errorMessage = err.message;

      showToast(errorMessage, "error");
    } finally {
      console.log("🔄 Setting loading to false...");
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">🏪</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Partner Login
            </h2>
            <p className="text-gray-600 mt-2">Welcome back, business partner</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Enter your business email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200"
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-[1.02]"
              }`}
            >
              {loading ? "Signing In..." : "Sign In as Partner"}
            </button>
          </form>

          {/* Debug Info - Remove in production */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            Debug: Check console for navigation logs
          </div>
        </div>
      </div>
    </>
  );
}

export default PartnerLogin;