// src/pages/PartnerRegister.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Simple Toast Component for debugging
const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
        : 'bg-red-50 border border-red-200 text-red-800'
    }`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'success' ? (
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

function PartnerRegister() {
  const navigate = useNavigate(); // Using React Router's useNavigate hook
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    password: "",   
    city: "",
    openTime: "",
    closeTime: "",
    images: [""],
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any existing toast when user starts typing
    if (toast) setToast(null);
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: [e.target.value] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    const requiredFields = ['name', 'address', 'phoneNumber', 'email', 'password', 'city', 'openTime', 'closeTime'];
    const emptyFields = requiredFields.filter(field => !formData[field].trim());
    
    if (emptyFields.length > 0) {
      showToast("Please fill in all required fields", "error");
      setLoading(false);
      return;
    }

    // Validate time format (basic check)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(formData.openTime) || !timeRegex.test(formData.closeTime)) {
      showToast("Please enter valid time format (HH:mm:ss)", "error");
      setLoading(false);
      return;
    }

    console.log("🚀 Sending registration payload:", formData);

    try {
      const res = await fetch("http://localhost:5002/api/salons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("✅ Registration response:", data);
      
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      
      // Success feedback
      showToast("Partner registration successful! Welcome to Style Studio 🎉", "success");
      console.log("Salon Saved:", data);
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/partner/login");
      }, 2000);

    } catch (err) {
      console.error("❌ Registration error:", err.message);
      
      // Better error handling
      let errorMessage = "Registration failed";
      
      if (err.message.includes('400')) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (err.message.includes('409') || err.message.includes('already exists')) {
        errorMessage = "Email already registered. Please use different email.";
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = "Cannot connect to server. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50" style={{transform: 'translate(4rem, -4rem)'}}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-30" style={{transform: 'translate(-3rem, 3rem)'}}></div>
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🏪</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Become a Partner
              </h2>
              <p className="text-gray-600 mt-2">Join our network of successful salons</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salon Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your salon name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                <textarea
                  name="address"
                  placeholder="Full business address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Business phone"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Open Time</label>
                  <input
                    type="text"
                    name="openTime"
                    placeholder="09:00:00"
                    value={formData.openTime}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Close Time</label>
                  <input
                    type="text"
                    name="closeTime"
                    placeholder="18:00:00"
                    value={formData.closeTime}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salon Image URL (Optional)</label>
                <input
                  type="url"
                  name="images"
                  placeholder="https://example.com/salon-image.jpg"
                  value={formData.images[0]}
                  onChange={handleImageChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs">i</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-800 mb-1">Partner Benefits:</h4>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Manage appointments & customers</li>
                      <li>• Automated payment processing</li>
                      <li>• Business analytics & insights</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  "Join as Partner 🚀"
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already a partner?{" "}
                <button 
                  onClick={() => navigate("/partner/login")}
                  className="text-purple-600 font-semibold hover:text-purple-800"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm mb-2">Looking for customer registration?</p>
              <button 
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                disabled={loading}
              >
                Customer Registration →
              </button>
            </div>

            <div className="mt-4 text-center">
              <button 
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-purple-600 transition-colors"
                disabled={loading}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PartnerRegister;
