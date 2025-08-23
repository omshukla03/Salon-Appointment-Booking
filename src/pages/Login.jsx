// src/pages/Login.jsx - Fixed version with better redirect logic

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

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

function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    if (!formData.email.trim() || !formData.password.trim()) {
      showToast("Please fill in all fields", "error");
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

    const payload = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    console.log("🚀 Attempting login with:", { email: payload.email });

    try {
      const res = await loginUser(payload);
      console.log("✅ Login successful:", res.data);
      
      // Extract user data and token from response
      const responseData = res.data;
      const user = responseData.user || responseData;
      const token = responseData.token || responseData.accessToken;
      
      console.log("👤 User data:", user);
      console.log("🔑 Token:", token ? "Present" : "Not found");

      // Store user data and token in localStorage
      if (token) {
        localStorage.setItem("token", token);
        console.log("✅ Token stored in localStorage");
      }
      
      if (user) {
        // Ensure we have all necessary user fields
        const userToStore = {
          id: user.id || user.userId,
          email: user.email,
          fullName: user.fullName || user.name,
          role: user.role,
          ...user // Include any other fields
        };
        
        localStorage.setItem("user", JSON.stringify(userToStore));
        console.log("✅ User data stored:", userToStore);
        
        // Success feedback
        showToast("Login successful! Redirecting...", "success");
        
        // Navigate based on user role with a short delay
        setTimeout(() => {
          console.log("🔄 Redirecting user with role:", userToStore.role);
          
          if (userToStore.role === "OWNER") {
            console.log("➡️ Redirecting to /dashboard");
            navigate("/dashboard", { replace: true });
          } else {
            console.log("➡️ Redirecting to /customer/dashboard");
            navigate("/customer/dashboard", { replace: true });
          }
        }, 1000); // Reduced delay for better UX
        
      } else {
        throw new Error("User data not found in response");
      }

    } catch (err) {
      console.error("❌ Login failed:", err);
      
      // Better error handling
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = "Invalid email or password format";
            break;
          case 401:
            errorMessage = "Invalid email or password";
            break;
          case 404:
            errorMessage = "User not found. Please check your email.";
            break;
          case 422:
            errorMessage = "Please check your email and password format";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || `Error: ${status}`;
        }
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (err.message.includes('timeout')) {
        errorMessage = "Request timeout. Please try again.";
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
                Welcome Back
              </h2>
              <p className="text-gray-600 mt-2">Sign in to your Style Studio account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button 
                  type="button" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Forgot password?
                </button>
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
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/register")}
                  className="text-blue-600 font-semibold hover:text-blue-800"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm mb-2">Looking for partner login?</p>
              <button 
                onClick={() => navigate("/partner/login")}
                className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                disabled={loading}
              >
                Partner Login →
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

export default Login;