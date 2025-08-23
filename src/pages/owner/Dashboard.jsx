import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentSalonId, getCurrentSalon, isPartnerAuthenticated, makeAuthenticatedRequest } from "../../utils/authUtils";
import { Calendar, TrendingUp, Users, DollarSign, Clock, BarChart3, CheckCircle, XCircle, Plus, Eye, CreditCard, AlertTriangle } from "lucide-react";
import "./owner-dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalServices: 0,
    totalEarnings: 0,
    todayBookings: 0,
    monthlyBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salonId, setSalonId] = useState(null);
  const [salon, setSalon] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const currentSalonId = getCurrentSalonId();
    const currentSalon = getCurrentSalon();
    const isAuthenticated = isPartnerAuthenticated();
    
    setSalonId(currentSalonId);
    setSalon(currentSalon);
    
    if (!isAuthenticated) {
      navigate("/partner/login");
      return;
    }
    
    fetchDashboardData();
    fetchOwnerBookings();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [navigate]);

  const fetchOwnerBookings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = userData.id;
      
      if (!ownerId) {
        return;
      }

      const response = await axios.get(`http://localhost:5005/api/bookings/owner/${ownerId}`);
      
      const normalizedBookings = (response.data || []).map(booking => ({
        ...booking,
        id: booking.id,
        salonId: parseInt(booking.salonId),
        totalPrice: booking.totalPrice || 0,
        status: booking.status || 'UNKNOWN',
        paymentMethod: booking.paymentMethod || 'UNKNOWN',
        paymentStatus: booking.paymentStatus || 'UNKNOWN',
        serviceIds: booking.serviceIds || []
      }));
      
      setOwnerBookings(normalizedBookings);
      
    } catch (error) {
      console.error("Error fetching owner bookings:", error);
      setOwnerBookings([]);
    }
  };

  const handleMarkPaymentReceived = async (booking) => {
    try {
      const confirmPayment = window.confirm(
        `Mark payment as received for Booking #${booking.id}?\n\n` +
        `Customer: ${booking.customerName || 'Unknown'}\n` +
        `Amount: ₹${booking.totalPrice}\n` +
        `Date: ${formatDateTime(booking.startTime)}\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmPayment) return;

      await axios.patch(`http://localhost:5006/api/payments/mark-received/${booking.id}`, {
        receivedAmount: booking.totalPrice,
        receivedAt: new Date().toISOString(),
        receivedBy: JSON.parse(localStorage.getItem("user"))?.id,
        paymentMethod: "CASH_AT_SALON"
      });

      await axios.patch(`http://localhost:5005/api/bookings/${booking.id}/payment-status`, {
        paymentStatus: "COMPLETED",
        paidAt: new Date().toISOString()
      });

      alert(`Payment marked as received for Booking #${booking.id}`);
      fetchOwnerBookings();
      fetchDashboardData();

    } catch (error) {
      console.error("Error marking payment as received:", error);
      alert("Failed to mark payment as received. Please try again.");
    }
  };

  const handlePaymentDispute = async (booking) => {
    try {
      const disputeReason = window.prompt(
        `Enter dispute reason for Booking #${booking.id}:\n\n` +
        `Customer: ${booking.customerName || 'Unknown'}\n` +
        `Amount: ₹${booking.totalPrice}\n\n` +
        `Common reasons:\n` +
        `- Service not provided\n` +
        `- Customer didn't show up\n` +
        `- Quality issues\n` +
        `- Other (specify)`
      );

      if (!disputeReason || disputeReason.trim() === '') return;

      await axios.post(`http://localhost:5006/api/payments/dispute`, {
        bookingId: booking.id,
        reason: disputeReason.trim(),
        reportedBy: JSON.parse(localStorage.getItem("user"))?.id,
        status: "UNDER_REVIEW"
      });

      alert(`Dispute created for Booking #${booking.id}\n\nReason: ${disputeReason}\n\nThe dispute will be reviewed by support team.`);
      fetchOwnerBookings();

    } catch (error) {
      console.error("Error creating payment dispute:", error);
      alert("Failed to create dispute. Please contact support.");
    }
  };

  const fetchDashboardData = async () => {
    const currentSalonId = getCurrentSalonId();
    
    setLoading(true);
    setStatsLoading(true);
    setError(null);

    try {
      const [bookingsRes, servicesRes, paymentsRes] = await Promise.allSettled([
        fetchBookings(currentSalonId),
        fetchServices(currentSalonId),
        fetchPayments(currentSalonId)
      ]);

      let totalBookings = 0;
      let pendingBookings = 0;
      let completedBookings = 0;
      let cancelledBookings = 0;
      let todayBookings = 0;
      let monthlyBookings = 0;
      let recentBookingsList = [];

      if (bookingsRes.status === 'fulfilled') {
        const bookings = bookingsRes.value;
        totalBookings = bookings.length;
        pendingBookings = bookings.filter(b => b.status === 'pending').length;
        completedBookings = bookings.filter(b => b.status === 'completed').length;
        cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        
        const today = new Date().toDateString();
        todayBookings = bookings.filter(b => 
          new Date(b.bookingDate).toDateString() === today
        ).length;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        monthlyBookings = bookings.filter(b => {
          const bookingDate = new Date(b.bookingDate);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        }).length;

        recentBookingsList = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
      }

      let totalServices = 0;
      if (servicesRes.status === 'fulfilled') {
        totalServices = servicesRes.value.length;
      }

      let totalEarnings = 0;
      if (paymentsRes.status === 'fulfilled') {
        const payments = paymentsRes.value;
        totalEarnings = payments
          .filter(p => p.status === 'SUCCESS')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      }

      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalServices,
        totalEarnings,
        todayBookings,
        monthlyBookings
      });

      setRecentBookings(recentBookingsList);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. " + (err.message || ''));
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const fetchBookings = async (currentSalonId) => {
    const url = currentSalonId 
      ? `http://localhost:5005/api/bookings/salon/${currentSalonId}`
      : `http://localhost:5005/api/bookings/salon`;
      
    const response = await makeAuthenticatedRequest(url, { method: 'GET' });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  };

  const fetchServices = async (currentSalonId) => {
    const url = currentSalonId
      ? `http://localhost:5004/api/service-offering/salon/${currentSalonId}`
      : `http://localhost:5004/api/service-offering/salon`;
      
    const response = await makeAuthenticatedRequest(url, { method: 'GET' });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch services: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  };

  const fetchPayments = async (currentSalonId) => {
    const url = currentSalonId
      ? `http://localhost:5006/api/payments/salon/${currentSalonId}`
      : `http://localhost:5006/api/payments/salon`;
      
    const response = await makeAuthenticatedRequest(url, { method: 'GET' });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch payments: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatsCard = ({ icon: Icon, title, value, change, color, isLoading }) => (
    <div className={`stats-card fade-in`}>
      <div className="stats-card-header">
        <div className={`stats-icon ${color}`}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <Icon size={24} />
          )}
        </div>
        <div className="stats-content">
          <h3>{title}</h3>
          <div className={`stats-value ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading ? '...' : value}
          </div>
          {change && (
            <div className={`stats-change ${change > 0 ? 'positive' : 'negative'}`}>
              <TrendingUp size={12} />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const OwnerBookingCard = ({ booking }) => (
    <div className="booking-card slide-up">
      <div className="booking-header">
        <div>
          <h3 className="booking-id">Booking #{booking.id}</h3>
          <p className="booking-customer">{booking.customerName || `Customer ID: ${booking.customerId}`}</p>
        </div>
        <div className="booking-status">
          <span className={`status-badge ${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
          {booking.paymentStatus && (
            <span className={`status-badge payment-${booking.paymentStatus.toLowerCase().replace('_', '-')}`}>
              {booking.paymentStatus === 'PENDING_SALON_PAYMENT' ? 'Pay at Salon' : booking.paymentStatus}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <p><span className="font-medium flex items-center gap-1"><Calendar size={14} /> Date:</span> {formatDateTime(booking.startTime)}</p>
        <p><span className="font-medium flex items-center gap-1"><Users size={14} /> Services:</span> {booking.serviceIds?.length || 0} selected</p>
        {booking.paymentMethod && (
          <p><span className="font-medium flex items-center gap-1"><CreditCard size={14} /> Payment:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              booking.paymentMethod === 'PAY_AT_SALON' ? 'bg-orange-100 text-orange-800' :
              booking.paymentMethod === 'RAZORPAY' ? 'bg-blue-100 text-blue-800' :
              booking.paymentMethod === 'STRIPE' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {booking.paymentMethod === 'PAY_AT_SALON' ? 'Pay at Salon' :
               booking.paymentMethod === 'RAZORPAY' ? 'Razorpay' :
               booking.paymentMethod === 'STRIPE' ? 'Stripe' :
               booking.paymentMethod}
            </span>
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div>
          <span className="font-bold gradient-text-green text-lg">₹{booking.totalPrice || 0}</span>
          {booking.paymentMethod === 'PAY_AT_SALON' && booking.paymentStatus === 'PENDING_SALON_PAYMENT' && (
            <p className="text-xs text-orange-600">Awaiting salon payment</p>
          )}
        </div>

        <div className="action-buttons">
          {booking.paymentStatus === 'PENDING_SALON_PAYMENT' && (
            <button
              onClick={() => handleMarkPaymentReceived(booking)}
              className="action-btn success"
            >
              <CheckCircle size={16} /> Mark Paid
            </button>
          )}

          {(booking.paymentStatus === 'COMPLETED' || booking.paymentStatus === 'PENDING_SALON_PAYMENT') && (
            <button
              onClick={() => handlePaymentDispute(booking)}
              className="action-btn warning"
            >
              <AlertTriangle size={16} /> Dispute
            </button>
          )}

          <button
            onClick={() => {
              alert(`Booking Details:\n\nID: ${booking.id}\nCustomer: ${booking.customerName || 'Unknown'}\nAmount: ₹${booking.totalPrice}\nStatus: ${booking.status}\nPayment: ${booking.paymentMethod}\nPayment Status: ${booking.paymentStatus}`);
            }}
            className="action-btn info"
          >
            <Eye size={16} /> Details
          </button>
        </div>
      </div>

      {booking.paymentMethod === 'PAY_AT_SALON' && booking.paymentStatus === 'PENDING_SALON_PAYMENT' && (
        <div className="alert warning">
          <AlertTriangle size={20} />
          <div>
            <p className="font-medium">Action Required:</p>
            <p>Customer will pay ₹{booking.totalPrice} when they arrive. Mark as paid after receiving payment.</p>
          </div>
        </div>
      )}
    </div>
  );

  const getFilteredBookings = () => {
    if (bookingFilter === 'all') return ownerBookings;
    return ownerBookings.filter(booking => booking.paymentStatus === bookingFilter);
  };

  if (loading) {
    return (
      <div className="owner-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-dashboard">
        <div className="alert error">
          <XCircle size={20} />
          <div>
            <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="mb-4">{error}</p>
            <div className="flex gap-4">
              <button onClick={fetchDashboardData} className="btn btn-danger">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab("overview")}
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
        >
          <BarChart3 size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`tab-button ${activeTab === "bookings" ? "active" : ""}`}
        >
          <Calendar size={16} /> All Bookings ({ownerBookings.length})
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="fade-in">
          {/* Welcome Section with Date/Time */}
          <div className="content-card mb-8">
            <div className="card-content text-center">
              <h1 className="text-4xl font-bold gradient-text mb-4">
                Welcome back to {salon?.name || 'your salon'}!
              </h1>
              <div className="text-gray-600 mb-6 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  <span className="text-lg font-medium">{formatFullDate(currentTime)}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock size={16} />
                  <span className="text-sm">{formatTime(currentTime)}</span>
                </div>
              </div>
              <p className="text-xl text-gray-600">
                Here's what's happening with your business today.
              </p>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="stats-grid mb-8">
            <StatsCard
              icon={Calendar}
              title="Total Bookings"
              value={stats.totalBookings}
              color="blue"
              isLoading={statsLoading}
              change={5.2}
            />
            <StatsCard
              icon={Clock}
              title="Pending"
              value={stats.pendingBookings}
              color="yellow"
              isLoading={statsLoading}
              change={-2.1}
            />
            <StatsCard
              icon={CheckCircle}
              title="Completed"
              value={stats.completedBookings}
              color="green"
              isLoading={statsLoading}
              change={12.3}
            />
            <StatsCard
              icon={DollarSign}
              title="Total Earnings"
              value={`₹${stats.totalEarnings}`}
              color="green"
              isLoading={statsLoading}
              change={8.7}
            />
            <StatsCard
              icon={Users}
              title="Services"
              value={stats.totalServices}
              color="purple"
              isLoading={statsLoading}
            />
            <StatsCard
              icon={TrendingUp}
              title="Today"
              value={stats.todayBookings}
              color="indigo"
              isLoading={statsLoading}
              change={15.4}
            />
            <StatsCard
              icon={BarChart3}
              title="This Month"
              value={stats.monthlyBookings}
              color="blue"
              isLoading={statsLoading}
              change={7.9}
            />
            <StatsCard
              icon={XCircle}
              title="Cancelled"
              value={stats.cancelledBookings}
              color="yellow"
              isLoading={statsLoading}
              change={-3.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Bookings */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Recent Bookings</h3>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="btn btn-primary btn-sm"
                >
                  View All
                </button>
              </div>
              
              <div className="card-content">
                {recentBookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Calendar size={48} /></div>
                    <h4 className="empty-state-title">No recent bookings</h4>
                    <p className="empty-state-description">Bookings will appear here when customers make appointments.</p>
                    <button onClick={fetchDashboardData} className="btn btn-primary">
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="glass-card p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">
                              Booking #{booking.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.bookingDate)}
                            </p>
                            {booking.customerName && (
                              <p className="text-sm text-gray-600">
                                Customer: {booking.customerName}
                              </p>
                            )}
                          </div>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              
              <div className="card-content">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate("/dashboard/add-service")}
                    className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left"
                  >
                    <div className="text-4xl mb-3"><Plus size={32} /></div>
                    <p className="font-semibold gradient-text">Add Service</p>
                    <p className="text-sm text-gray-600">Create new service</p>
                  </button>

                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left"
                  >
                    <div className="text-4xl mb-3"><Calendar size={32} /></div>
                    <p className="font-semibold gradient-text-green">View Bookings</p>
                    <p className="text-sm text-gray-600">Manage appointments</p>
                  </button>

                  <button
                    onClick={() => navigate("/dashboard/payments")}
                    className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left"
                  >
                    <div className="text-4xl mb-3"><CreditCard size={32} /></div>
                    <p className="font-semibold gradient-text">Payments</p>
                    <p className="text-sm text-gray-600">View transactions</p>
                  </button>

                  <button
                    onClick={() => navigate("/dashboard/services")}
                    className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left"
                  >
                    <div className="text-4xl mb-3"><Users size={32} /></div>
                    <p className="font-semibold gradient-text-orange">Services</p>
                    <p className="text-sm text-gray-600">Manage offerings</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pay at Salon Summary */}
          {ownerBookings.filter(b => b.paymentStatus === 'PENDING_SALON_PAYMENT').length > 0 && (
            <div className="alert warning scale-in">
              <DollarSign size={20} />
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="font-semibold mb-2">Pay at Salon Bookings</h3>
                  <p className="mb-1">
                    {ownerBookings.filter(b => b.paymentStatus === 'PENDING_SALON_PAYMENT').length} bookings awaiting payment collection
                  </p>
                  <p className="text-sm">
                    Total amount to collect: ₹{ownerBookings
                      .filter(b => b.paymentStatus === 'PENDING_SALON_PAYMENT')
                      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("bookings");
                    setBookingFilter("PENDING_SALON_PAYMENT");
                  }}
                  className="btn btn-primary"
                >
                  View All
                </button>
              </div>
            </div>
          )}

          {/* Salon Info Card */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  {salon?.name || 'Your Salon'}
                </h3>
                <div className="space-y-2 text-gray-600">
                  {salon?.address && <p className="flex items-center gap-2">📍 {salon.address}</p>}
                  {salon?.city && <p className="flex items-center gap-2">🏙️ {salon.city}</p>}
                  {salon?.phoneNumber && <p className="flex items-center gap-2">📞 {salon.phoneNumber}</p>}
                  {salon?.openTime && salon?.closeTime && (
                    <p className="flex items-center gap-2">🕐 {salon.openTime} - {salon.closeTime}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/account")}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Bookings Tab Content
        <div className="fade-in">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold gradient-text">All Bookings</h2>
              <div className="flex space-x-3">
                <select 
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white"
                >
                  <option value="all">All Bookings</option>
                  <option value="PENDING_SALON_PAYMENT">Pay at Salon</option>
                  <option value="COMPLETED">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="DISPUTED">Disputed</option>
                </select>
                <button
                  onClick={fetchOwnerBookings}
                  className="btn btn-primary"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {getFilteredBookings().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredBookings().map((booking) => (
                  <OwnerBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="content-card">
                <div className="empty-state">
                  <div className="empty-state-icon"><Calendar size={48} /></div>
                  <h3 className="empty-state-title">No Bookings Found</h3>
                  <p className="empty-state-description">
                    {bookingFilter === 'all' 
                      ? 'Bookings will appear here when customers make appointments.' 
                      : `No bookings found with status: ${bookingFilter}`
                    }
                  </p>
                  <button
                    onClick={fetchOwnerBookings}
                    className="btn btn-primary"
                  >
                    Refresh Bookings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}