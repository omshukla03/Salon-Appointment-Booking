// src/pages/Register.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

// Custom Toast Component
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

function Register() {
  const navigate = useNavigate(); // Using React Router's useNavigate hook
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: ""
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    const requiredFields = ['fullName', 'username', 'email', 'password', 'phone'];
    const emptyFields = requiredFields.filter(field => !formData[field].trim());
    
    if (emptyFields.length > 0) {
      showToast("Please fill in all required fields", "error");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      setLoading(false);
      return;
    }

    // Password length validation
    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      setLoading(false);
      return;
    }

    console.log("🚀 Sending registration payload:", formData);

    try {
      const res = await registerUser(formData);
      console.log("✅ Registration response:", res.data);
      
      // Success feedback
      showToast("Registration successful! Welcome to Style Studio 🎉", "success");
      
      // Navigate to login after a short delay to show the success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("❌ Registration error:", err);
      
      // Better error handling
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.status === 409 || err.message.includes('already exists')) {
        errorMessage = "Email or username already exists. Please use different credentials.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = "Cannot connect to server. Please try again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">✂</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join Style Studio
              </h2>
              <p className="text-gray-600 mt-2">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs">i</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Member Benefits:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Book appointments instantly</li>
                      <li>• Track your beauty journey</li>
                      <li>• Get exclusive offers & rewards</li>
                      <li>• Rate and review services</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account ✨"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-semibold hover:text-blue-800"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm mb-2">Want to become a partner?</p>
              <button 
                onClick={() => navigate("/partner/register")}
                className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                disabled={loading}
              >
                Partner Registration →
              </button>
            </div>

            <div className="mt-4 text-center">
              <button 
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-blue-600 transition-colors"
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

export default Register;