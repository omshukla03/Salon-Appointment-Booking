// src/pages/customer/Dashboard.jsx - Enhanced Professional Dashboard

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BookingForm from "../../components/BookingForm";
import './Dashboard.css';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [salons, setSalons] = useState([]);
  const [salonDetails, setSalonDetails] = useState({}); // Store salon details by ID
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [error, setError] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // State for notifications
  const [notification, setNotification] = useState(null);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlert, setCustomAlert] = useState({ type: '', title: '', message: '', details: '' });

  // Stats state
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    availableSalons: 0
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    // Handle navigation state messages
    if (location.state) {
      const { message, error: errorMsg, activeTab: tabFromState, paymentId, bookingId } = location.state;
      
      if (message) {
        setNotification({
          type: 'success',
          message: message,
          paymentId: paymentId,
          bookingId: bookingId
        });
      } else if (errorMsg) {
        setNotification({
          type: 'error',
          message: errorMsg,
          paymentId: paymentId
        });
      }
      
      if (tabFromState) {
        setActiveTab(tabFromState);
      }
      
      window.history.replaceState({}, document.title);
    }

    // Check for payment success data
    const paymentSuccessData = localStorage.getItem("paymentSuccess");
    if (paymentSuccessData) {
      try {
        const successInfo = JSON.parse(paymentSuccessData);
        setNotification({
          type: 'success',
          message: successInfo.message || "Payment completed successfully!",
          paymentId: successInfo.paymentId,
          bookingId: successInfo.bookingId,
          amount: successInfo.amount
        });
        
        localStorage.removeItem("paymentSuccess");
      } catch (err) {
        console.error("Error parsing payment success data:", err);
      }
    }

    fetchSalons();
    fetchUserBookings();

    // Auto-dismiss notification
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [navigate, location.state]);

  // Auto-refresh bookings after payment success
  useEffect(() => {
    if (notification && notification.type === 'success') {
      const refreshTimer = setTimeout(() => {
        fetchUserBookings();
      }, 3000);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [notification]);

  // Calculate stats when bookings change
  useEffect(() => {
    const totalBookings = userBookings.length;
    const confirmedBookings = userBookings.filter(booking => booking.status === 'CONFIRMED').length;
    const pendingBookings = userBookings.filter(booking => booking.status === 'PENDING').length;
    const availableSalons = salons.length;

    setStats({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      availableSalons
    });
  }, [userBookings, salons]);

  const fetchSalons = async () => {
    try {
      setError("");
      const response = await axios.get("http://localhost:5002/api/salons");
      
      const validSalons = response.data.filter(salon => {
        return salon.id && salon.name;
      }).map(salon => ({
        ...salon,
        id: parseInt(salon.id),
        name: salon.name || `Salon #${salon.id}`,
        address: salon.address || 'Address not available',
        city: salon.city || 'City not specified',
        phoneNumber: salon.phoneNumber || 'Phone not available'
      }));

      setSalons(validSalons);
      
      // Store salon details for quick lookup
      const salonLookup = {};
      validSalons.forEach(salon => {
        salonLookup[salon.id] = salon;
      });
      setSalonDetails(salonLookup);
      
      if (validSalons.length === 0) {
        setError("No valid salons found. Please contact support.");
      }
      
    } catch (error) {
      console.error("Error fetching salons:", error);
      setError("Failed to load salons. Please check your connection and try again.");
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id || userData.userId;
      
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const response = await axios.get(`http://localhost:5005/api/bookings/customer/${userId}`);
      
      const normalizedBookings = (response.data || []).map(booking => ({
        ...booking,
        id: booking.id,
        salonId: parseInt(booking.salonId),
        totalPrice: booking.totalPrice || 0,
        status: booking.status || 'UNKNOWN',
        serviceIds: booking.serviceIds || []
      }));

      // Sort bookings by creation date (most recent first)
      const sortedBookings = normalizedBookings.sort((a, b) => {
        return new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime);
      });
      
      setUserBookings(sortedBookings);
      
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
    }
  };

  const handleBookNow = async (salon) => {
    if (!salon || !salon.id) {
      showAlert('error', 'Invalid Salon', 'Invalid salon data. Please try selecting a different salon.');
      return;
    }

    const salonId = parseInt(salon.id);
    if (isNaN(salonId)) {
      showAlert('error', 'Invalid Salon', 'Invalid salon ID. Please try again.');
      return;
    }

    try {
      localStorage.setItem("salonId", salonId.toString());
      
      const response = await axios.get(`http://localhost:5002/api/salons/${salonId}`);
      
      if (response.data) {
        const enhancedSalon = {
          ...salon,
          ...response.data,
          id: salonId
        };
        
        setSelectedSalon(enhancedSalon);
        setShowBookingForm(true);
      } else {
        throw new Error("Salon not found on server");
      }
      
    } catch (error) {
      console.error("Salon verification failed:", error);
      
      if (error.response?.status === 404) {
        showAlert('error', 'Salon Not Found', `Salon not found (ID: ${salonId}). Please try a different salon.`);
      } else {
        localStorage.setItem("salonId", salonId.toString());
        
        const fallbackSalon = {
          ...salon,
          id: salonId
        };
        
        setSelectedSalon(fallbackSalon);
        setShowBookingForm(true);
      }
    }
  };

  const handleBookingSuccess = async (bookingData) => {
    try {
      if (!bookingData || !bookingData.id) {
        throw new Error("Invalid booking data received");
      }

      setNotification({
        type: 'success',
        message: "Booking created successfully! Redirecting to payment...",
        bookingId: bookingData.id
      });

    } catch (error) {
      console.error("Post-booking processing error:", error);
      setNotification({
        type: 'warning',
        message: "Booking created, but there was an issue with follow-up processing."
      });
    }
    
    setShowBookingForm(false);
    setSelectedSalon(null);
    localStorage.removeItem("salonId");
    fetchUserBookings();
  };

  const handleBookingError = (error, bookingData) => {
    console.error("Booking creation failed:", error);
    
    let errorMessage = "Booking failed";
    let errorDetails = "";
    
    if (error.response?.status === 400) {
      errorMessage = "Invalid booking data";
      errorDetails = "Please check your selections and try again.";
    } else if (error.response?.status === 409) {
      errorMessage = "Time slot unavailable";
      errorDetails = "The selected time slot is no longer available. Please choose a different time.";
    } else if (error.response?.status === 500) {
      errorMessage = "Server error";
      errorDetails = "Please try again or contact support if the problem persists.";
    } else if (error.response?.data?.message) {
      errorMessage = "Booking Failed";
      errorDetails = error.response.data.message;
    } else if (error.message) {
      errorMessage = "Booking Error";
      errorDetails = error.message;
    }
    
    showAlert('error', errorMessage, errorDetails);
    
    setShowBookingForm(false);
    setSelectedSalon(null);
    localStorage.removeItem("salonId");
  };

  const handleDeleteBooking = async (bookingId) => {
    const confirmed = await showConfirmDialog(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5005/api/bookings/${bookingId}`);
      
      showAlert('success', 'Booking Deleted', 'Your booking has been successfully deleted.');
      
      fetchUserBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Error deleting booking:", error);
      showAlert('error', 'Delete Failed', 'Failed to delete booking. Please try again.');
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'You will need to login again to access your account.'
    );

    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("salonId");
      localStorage.removeItem("paymentSuccess");
      navigate("/login");
    }
  };

  // Profile dropdown handlers
  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    showAlert('info', 'Profile', 'Profile management feature coming soon!', 
      `Name: ${user?.fullName || 'N/A'}\nEmail: ${user?.email || 'N/A'}\nPhone: ${user?.phone || 'N/A'}`);
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
    showAlert('info', 'Settings', 'Settings panel will be available soon!', 
      'Manage your preferences, notifications, and account settings.');
  };

  const handleNotifications = () => {
    setShowProfileDropdown(false);
    showAlert('info', 'Notifications', 'Notification center coming soon!', 
      'View and manage all your booking updates and system notifications.');
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getTimeUntilAppointment = (startTime) => {
    if (!startTime) return "N/A";
    
    try {
      const appointmentTime = new Date(startTime);
      const now = new Date();
      const timeDiff = appointmentTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        return "Past appointment";
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days} days, ${hours} hours`;
      } else if (hours > 0) {
        return `${hours} hours, ${minutes} minutes`;
      } else {
        return `${minutes} minutes`;
      }
    } catch (error) {
      return "Invalid time";
    }
  };

  const handlePaymentCheck = async (bookingId) => {
    try {
      const response = await axios.get(`http://localhost:5006/api/payments/basic/${bookingId}`);
      const payment = response.data;
      
      const paymentDetails = `Status: ${payment.status}\nAmount: ₹${payment.amount}\nMethod: ${payment.paymentMethod}\nDate: ${new Date(payment.createdAt || Date.now()).toLocaleDateString()}`;
      
      showAlert('info', 'Payment Details', `Payment information for Booking #${bookingId}`, paymentDetails);
      
    } catch (error) {
      console.error("Error checking payment:", error);
      
      if (error.response?.status === 404) {
        showAlert('warning', 'Payment Not Found', 'No payment record found for this booking', 
          'The payment may still be processing or was not completed.');
      } else {
        showAlert('error', 'Payment Check Failed', 'Could not retrieve payment status', 
          'Please try again later or contact support.');
      }
    }
  };

  const handleRetryPayment = async (booking) => {
    try {
      const paymentPayload = {
        id: booking.id,
        salonId: parseInt(booking.salonId),
        customerId: parseInt(booking.customerId),
        totalPrice: Math.max(booking.totalPrice || 100, 25)
      };

      const paymentMethod = await showPaymentMethodSelection();
      
      if (!paymentMethod) {
        return;
      }

      if (paymentMethod === 'PAY_AT_SALON') {
        try {
          await axios.patch(`http://localhost:5005/api/bookings/${booking.id}/status`, {
            status: "CONFIRMED",
            paymentMethod: "PAY_AT_SALON",
            paymentStatus: "PENDING_SALON_PAYMENT"
          });

          await axios.post(`http://localhost:5006/api/payments/pay-at-salon`, {
            bookingId: booking.id,
            paymentMethod: "PAY_AT_SALON",
            status: "PENDING_SALON_PAYMENT",
            amount: booking.totalPrice || 0
          });

          showAlert('success', 'Pay at Salon Confirmed', 'Your booking has been confirmed!', 
            'You can pay when you visit the salon. Please bring cash or card for payment.');

          fetchUserBookings();
          return;
        } catch (error) {
          console.error("Pay at salon setup failed:", error);
          showAlert('error', 'Setup Failed', 'Failed to set up pay-at-salon option', 
            'Please try a different payment method or contact support.');
          return;
        }
      }

      const paymentResponse = await axios.post(
        `http://localhost:5006/api/payments/create?paymentMethod=${paymentMethod}`,
        paymentPayload,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentUrl = paymentResponse.data.payment_link_url || 
                        paymentResponse.data.paymentLink || 
                        paymentResponse.data.url;
      
      if (paymentUrl) {
        const methodName = paymentMethod === 'RAZORPAY' ? 'Razorpay' : 'Stripe';
        
        showAlert('success', 'Payment Initiated', `${methodName} payment is being prepared`, 
          'You will be redirected to the payment page in a moment...');
        
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 2000);
      } else {
        showAlert('error', 'Payment Link Failed', 'Payment link could not be generated', 
          'Please try again or contact support for assistance.');
      }
      
    } catch (error) {
      console.error("Error retrying payment:", error);
      showAlert('error', 'Payment Retry Failed', 'Could not process payment retry', 
        'Please try again later or contact support if the problem persists.');
    }
  };

  const showPaymentMethodSelection = () => {
    return new Promise((resolve) => {
      const choice = window.confirm(
        "Choose payment method:\n\n" +
        "OK = Pay Online (Stripe/Razorpay)\n" +
        "Cancel = Pay at Salon\n\n" +
        "Click OK for online payment or Cancel to pay at salon."
      );
      
      if (choice) {
        const onlineChoice = window.confirm(
          "Online Payment Method:\n\n" +
          "OK = Razorpay\n" +
          "Cancel = Stripe"
        );
        resolve(onlineChoice ? 'RAZORPAY' : 'STRIPE');
      } else {
        resolve('PAY_AT_SALON');
      }
    });
  };

  // Enhanced alert system
  const showAlert = (type, title, message, details = '') => {
    setCustomAlert({ type, title, message, details });
    setShowCustomAlert(true);
  };

  const showConfirmDialog = (title, message, details = '') => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`${title}\n\n${message}\n\n${details}`);
      resolve(confirmed);
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const getRecentBookings = () => {
    return userBookings.slice(0, 3); // Show only 3 most recent bookings
  };

  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
    }
    return 'U';
  };

  const canDeleteBooking = (booking) => {
    // Allow deletion of past bookings or cancelled bookings
    const appointmentTime = new Date(booking.startTime);
    const now = new Date();
    return appointmentTime < now || booking.status === 'CANCELLED';
  };

  // Get salon name by ID
  const getSalonName = (salonId) => {
    const salon = salonDetails[salonId];
    return salon ? salon.name : `Salon #${salonId}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">Loading your dashboard...</p>
          <p className="text-gray-500">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Custom Alert Modal */}
      {showCustomAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className={`px-6 py-4 rounded-t-2xl ${
              customAlert.type === 'success' ? 'bg-green-50 border-b border-green-200' :
              customAlert.type === 'error' ? 'bg-red-50 border-b border-red-200' :
              customAlert.type === 'warning' ? 'bg-yellow-50 border-b border-yellow-200' :
              'bg-blue-50 border-b border-blue-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  customAlert.type === 'success' ? 'bg-green-100 text-green-600' :
                  customAlert.type === 'error' ? 'bg-red-100 text-red-600' :
                  customAlert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <i className={`fas ${
                    customAlert.type === 'success' ? 'fa-check-circle' :
                    customAlert.type === 'error' ? 'fa-exclamation-circle' :
                    customAlert.type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                  } text-lg`}></i>
                </div>
                <h3 className={`font-bold text-lg ${
                  customAlert.type === 'success' ? 'text-green-800' :
                  customAlert.type === 'error' ? 'text-red-800' :
                  customAlert.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>{customAlert.title}</h3>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-3">{customAlert.message}</p>
              {customAlert.details && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">{customAlert.details}</pre>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCustomAlert(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    customAlert.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    customAlert.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    customAlert.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div className={`notification-banner ${
          notification.type === 'error' ? 'error' : 
          notification.type === 'warning' ? 'warning' : ''
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className={`fas ${
                notification.type === 'success' ? 'fa-check-circle' :
                notification.type === 'error' ? 'fa-exclamation-circle' :
                notification.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
              } text-xl`}></i>
              <div>
                <p className="font-semibold">{notification.message}</p>
                {(notification.paymentId || notification.bookingId) && (
                  <p className="text-sm opacity-90">
                    {notification.paymentId && `Payment: #${notification.paymentId}`}
                    {notification.paymentId && notification.bookingId && ' | '}
                    {notification.bookingId && `Booking: #${notification.bookingId}`}
                    {notification.amount && ` | Amount: ₹${notification.amount}`}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeNotification}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header with background image */}
      <div className={`dashboard-header ${notification ? 'mt-16' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="hero-content">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Welcome back, {user?.fullName?.split(' ')[0] || 'Guest'}!
                </h1>
                <p className="text-xl opacity-90 mb-4">Manage your appointments and discover new styles</p>
                {error && (
                  <div className="mt-3 p-3 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg">
                    <p className="text-sm flex items-center">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {error}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Enhanced Profile Section */}
              <div className="profile-section">
                <div className="text-right mr-4">
                  <p className="text-sm opacity-80">Good to see you,</p>
                  <p className="font-semibold text-lg">{user?.fullName || 'Customer'}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="profile-avatar"
                  >
                    {getUserInitials()}
                  </button>
                  
                  {/* Enhanced Profile Dropdown with proper z-index */}
                  <div className={`profile-dropdown ${showProfileDropdown ? 'active' : ''}`} style={{ zIndex: 1000 }}>
                    <button className="dropdown-item" onClick={handleViewProfile}>
                      <i className="fas fa-user"></i>
                      <span>View Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={handleSettings}>
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </button>
                    <button className="dropdown-item" onClick={handleNotifications}>
                      <i className="fas fa-bell"></i>
                      <span>Notifications</span>
                    </button>
                    <hr className="border-gray-200 my-1" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation with better button styling */}
      <div className="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="nav-tabs">
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              style={{ outline: 'none', border: 'none' }}
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              style={{ outline: 'none', border: 'none' }}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>My Bookings</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold ml-2">
                {userBookings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('salons')}
              className={`nav-tab ${activeTab === 'salons' ? 'active' : ''}`}
              style={{ outline: 'none', border: 'none' }}
            >
              <i className="fas fa-store"></i>
              <span>Browse Salons</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold ml-2">
                {salons.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Home Tab */}
      {activeTab === 'home' && (
        <div className="content-section">
          {/* Welcome Section with Stats */}
          <div className="welcome-section">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Dashboard Overview</h2>
            <p className="text-gray-600 mb-6">Track your bookings and explore new styling options</p>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon primary">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-value">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon success">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-value">{stats.confirmedBookings}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon warning">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-value">{stats.pendingBookings}</div>
                <div className="stat-label">Pending</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon secondary">
                  <i className="fas fa-store"></i>
                </div>
                <div className="stat-value">{stats.availableSalons}</div>
                <div className="stat-label">Available Salons</div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Bookings Section with better spacing */}
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-history" style={{ marginRight: '0.75rem' }}></i>
              Recent Bookings
            </h2>
            <button
              onClick={() => setActiveTab('bookings')}
              className="btn btn-secondary"
              style={{ marginLeft: '1rem' }}
            >
              <span>View All</span>
              <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
            </button>
          </div>

          {getRecentBookings().length > 0 ? (
            <div className="grid-responsive">
              {getRecentBookings().map((booking, index) => (
                <div key={booking.id} className={`booking-card p-6 ${index === 0 ? 'recent' : ''}`}>
                  <div className="flex-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{getSalonName(booking.salonId)}</h3>
                      {index === 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          <i className="fas fa-star mr-1"></i>Most Recent
                        </span>
                      )}
                    </div>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      <i className={`fas ${
                        booking.status === 'CONFIRMED' ? 'fa-check' :
                        booking.status === 'PENDING' ? 'fa-clock' : 'fa-times'
                      }`}></i>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-calendar-alt w-5 text-blue-500"></i>
                      <span className="ml-2">{formatDateTime(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-clock w-5 text-green-500"></i>
                      <span className="ml-2">{getTimeUntilAppointment(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-list w-5 text-purple-500"></i>
                      <span className="ml-2">{booking.serviceIds?.length || 0} services selected</span>
                    </div>
                  </div>
                  
                  <div className="flex-between pt-4 border-t border-gray-100">
                    <div className="price-display">₹{booking.totalPrice || 0}</div>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handlePaymentCheck(booking.id)}
                        className="action-btn action-btn-primary"
                      >
                        <i className="fas fa-credit-card"></i>
                        Payment
                      </button>
                      {canDeleteBooking(booking) && (
                        <button 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="action-btn action-btn-danger"
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-calendar-plus"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
              <p className="text-gray-500 mb-6">Book your first appointment to get started!</p>
              <button
                onClick={() => setActiveTab('salons')}
                className="btn btn-primary"
              >
                <i className="fas fa-plus mr-2"></i>
                Book Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced My Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="content-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-calendar-alt" style={{ marginRight: '0.75rem' }}></i>
              My Bookings
            </h2>
            <button
              onClick={fetchUserBookings}
              className="btn btn-secondary"
              style={{ marginLeft: '1rem' }}
            >
              <i className="fas fa-sync-alt" style={{ marginRight: '0.5rem' }}></i>
              Refresh
            </button>
          </div>
          
          {userBookings.length > 0 ? (
            <div className="grid-responsive">
              {userBookings.map((booking, index) => (
                <div key={booking.id} className={`booking-card p-6 ${index === 0 ? 'recent' : ''}`}>
                  <div className="flex-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{getSalonName(booking.salonId)}</h3>
                      {index === 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          <i className="fas fa-star mr-1"></i>Most Recent
                        </span>
                      )}
                      <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                    </div>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      <i className={`fas ${
                        booking.status === 'CONFIRMED' ? 'fa-check' :
                        booking.status === 'PENDING' ? 'fa-clock' : 'fa-times'
                      }`}></i>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-calendar-alt w-5 text-blue-500"></i>
                      <span className="ml-2 font-medium">Date:</span>
                      <span className="ml-2">{formatDateTime(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-clock w-5 text-green-500"></i>
                      <span className="ml-2 font-medium">Time Until:</span>
                      <span className="ml-2">{getTimeUntilAppointment(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-list w-5 text-purple-500"></i>
                      <span className="ml-2 font-medium">Services:</span>
                      <span className="ml-2">{booking.serviceIds?.length || 0} selected</span>
                    </div>
                    {booking.paymentMethod && (
                      <div className="flex items-center text-gray-700">
                        <i className="fas fa-credit-card w-5 text-indigo-500"></i>
                        <span className="ml-2 font-medium">Payment:</span>
                        <span className={`ml-2 payment-badge ${
                          booking.paymentMethod === 'PAY_AT_SALON' ? 'payment-salon' :
                          booking.paymentMethod === 'RAZORPAY' ? 'payment-razorpay' :
                          booking.paymentMethod === 'STRIPE' ? 'payment-stripe' :
                          'payment-badge'
                        }`}>
                          <i className={`fas ${
                            booking.paymentMethod === 'PAY_AT_SALON' ? 'fa-store' :
                            booking.paymentMethod === 'RAZORPAY' ? 'fa-mobile-alt' :
                            'fa-credit-card'
                          }`}></i>
                          {booking.paymentMethod === 'PAY_AT_SALON' ? 'Pay at Salon' :
                           booking.paymentMethod === 'RAZORPAY' ? 'Razorpay' :
                           booking.paymentMethod === 'STRIPE' ? 'Stripe' :
                           booking.paymentMethod}
                        </span>
                      </div>
                    )}
                    {booking.paymentStatus && booking.paymentStatus !== 'COMPLETED' && (
                      <div className="flex items-center text-gray-700">
                        <i className="fas fa-info-circle w-5 text-orange-500"></i>
                        <span className="ml-2 font-medium">Status:</span>
                        <span className={`ml-2 payment-badge ${
                          booking.paymentStatus === 'PENDING_SALON_PAYMENT' ? 'payment-salon' :
                          booking.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          <i className="fas fa-exclamation-circle"></i>
                          {booking.paymentStatus === 'PENDING_SALON_PAYMENT' ? 'Pay at Salon' : booking.paymentStatus}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="price-display">₹{booking.totalPrice || 0}</div>
                      {booking.paymentMethod === 'PAY_AT_SALON' && (
                        <span className="text-xs text-orange-600 font-medium">Pay when you visit</span>
                      )}
                    </div>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handlePaymentCheck(booking.id)}
                        className="action-btn action-btn-primary"
                      >
                        <i className="fas fa-credit-card"></i>
                        Check Payment
                      </button>
                      {(booking.status === 'PENDING' || 
                        (booking.paymentStatus && booking.paymentStatus !== 'COMPLETED')) && (
                        <button 
                          onClick={() => handleRetryPayment(booking)}
                          className="action-btn action-btn-primary"
                        >
                          <i className="fas fa-redo"></i>
                          {booking.paymentMethod === 'PAY_AT_SALON' ? 'Update Payment' : 'Retry Payment'}
                        </button>
                      )}
                      {canDeleteBooking(booking) && (
                        <button 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="action-btn action-btn-danger"
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-calendar-plus"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
              <p className="text-gray-500 mb-6">Book your first appointment to get started!</p>
              <button
                onClick={() => setActiveTab('salons')}
                className="btn btn-primary"
              >
                <i className="fas fa-plus mr-2"></i>
                Browse Salons
              </button>
            </div>
          )}
        </div>
      )}

      {/* Available Salons Tab */}
      {activeTab === 'salons' && (
        <div className="content-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-store" style={{ marginRight: '0.75rem' }}></i>
              Available Salons
            </h2>
            <button
              onClick={fetchSalons}
              className="btn btn-secondary"
              style={{ marginLeft: '1rem' }}
            >
              <i className="fas fa-sync-alt" style={{ marginRight: '0.5rem' }}></i>
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
              <div className="flex items-center space-x-3">
                <i className="fas fa-exclamation-triangle text-xl"></i>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {salons.length > 0 ? (
            <div className="grid-responsive">
              {salons.map((salon, index) => (
                <div key={salon.id} className="salon-card">
                  {/* Enhanced Salon Image */}
                  <div className="salon-image">
                    {salon.images && salon.images.length > 0 ? (
                      <img
                        src={salon.images[0]}
                        alt={salon.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className="salon-icon" style={{ display: salon.images && salon.images.length > 0 ? 'none' : 'block' }}>
                      <i className="fas fa-cut"></i>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm bg-opacity-90">
                        <i className="fas fa-check-circle mr-1"></i>
                        Available
                      </span>
                    </div>
                    
                    {/* Salon ID Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        <i className="fas fa-hashtag mr-1"></i>
                        {salon.id}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Salon Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {salon.name}
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start text-gray-600">
                        <i className="fas fa-map-marker-alt w-5 text-red-500 mt-1"></i>
                        <span className="ml-3 flex-1">{salon.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-city w-5 text-blue-500"></i>
                        <span className="ml-3 font-medium">{salon.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-phone w-5 text-green-500"></i>
                        <span className="ml-3 font-medium">{salon.phoneNumber}</span>
                      </div>
                      {salon.openTime && salon.closeTime && (
                        <div className="flex items-center text-gray-600">
                          <i className="fas fa-clock w-5 text-purple-500"></i>
                          <span className="ml-3 font-medium">{salon.openTime} - {salon.closeTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Salon Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleBookNow(salon)}
                        className="btn btn-primary w-full"
                      >
                        <i className="fas fa-calendar-plus"></i>
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-store-slash"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Salons Available</h3>
              <p className="text-gray-500 mb-6">
                {error ? "There was an error loading salons." : "Please check back later for available salons."}
              </p>
              <button
                onClick={fetchSalons}
                className="btn btn-primary"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
        
      {/* Enhanced Booking Form Modal */}
      {showBookingForm && selectedSalon && (
        <BookingForm
          salon={selectedSalon}
          salonId={selectedSalon.id}
          onSuccess={handleBookingSuccess}
          onError={handleBookingError}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedSalon(null);
            localStorage.removeItem("salonId");
          }}
        />
      )}

      {/* Click outside to close profile dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileDropdown(false)}
        ></div>
      )}
    </div>
  );
}