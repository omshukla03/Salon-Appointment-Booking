// src/pages/owner/Payments.jsx - Professional Redesign

import { useEffect, useState } from "react";
import { 
  RefreshCw, CreditCard, TrendingUp, Calendar, DollarSign, AlertCircle, 
  CheckCircle, Clock, Filter, BarChart3, Download, Eye, Users 
} from "lucide-react";
import { getCurrentSalonId, isPartnerAuthenticated, makeAuthenticatedRequest } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";
import "./services.css";

export default function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEarning: 0,
    lastPayment: 0,
    totalPayments: 0,
    successfulPayments: 0
  });

  // Get salon ID from authentication data
  const salonId = getCurrentSalonId();

  useEffect(() => {
    // Check if user is authenticated and has salon ID
    if (!isPartnerAuthenticated() || !salonId) {
      console.error("No salon ID found or user not authenticated");
      setError("Please login as a partner to view payments");
      navigate("/partner/login");
      return;
    }

    fetchPayments();
  }, [salonId, navigate]);

  const fetchPayments = async () => {
    if (!salonId) {
      setError("Salon ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("💳 Fetching payments for salon:", salonId);
      
      const response = await makeAuthenticatedRequest(
        `http://localhost:5006/api/payments/salon/${salonId}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      console.log("✅ Payments data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      setPayments(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("❌ Error fetching payments:", err);
      setError("Failed to fetch payments. Please try again.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentData) => {
    const successfulPayments = paymentData.filter(p => p.status === 'SUCCESS');
    const totalEarning = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastPayment = paymentData.length > 0 ? paymentData[paymentData.length - 1]?.amount || 0 : 0;

    setStats({
      totalEarning,
      lastPayment,
      totalPayments: paymentData.length,
      successfulPayments: successfulPayments.length
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle size={16} />;
      case 'PENDING':
        return <Clock size={16} />;
      case 'FAILED':
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="services-page">
        <div className="error-container">
          <div className="error-icon">
            <CreditCard size={48} />
          </div>
          <h3 className="error-title">Error Loading Payments</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-danger"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
            <button
              onClick={() => navigate("/partner/login")}
              className="btn btn-secondary"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="services-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <span className="loading-text">Loading payment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page fade-in">
      {/* Page Header */}
      <div className="services-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title gradient-text">Payment Management</h1>
            <p className="page-subtitle">Monitor and manage all payment transactions</p>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchPayments}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => alert("Export functionality coming soon!")}
              className="btn btn-primary"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="services-stats">
        <div className="stats-card">
          <div className="stats-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stats-content">
            <h3>Total Earning</h3>
            <div className="stats-value">₹{stats.totalEarning}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon blue">
            <CreditCard size={24} />
          </div>
          <div className="stats-content">
            <h3>Last Payment</h3>
            <div className="stats-value">₹{stats.lastPayment}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon purple">
            <BarChart3 size={24} />
          </div>
          <div className="stats-content">
            <h3>Total Payments</h3>
            <div className="stats-value">{stats.totalPayments}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon indigo">
            <CheckCircle size={24} />
          </div>
          <div className="stats-content">
            <h3>Successful</h3>
            <div className="stats-value">{stats.successfulPayments}</div>
          </div>
        </div>
      </div>

      {/* Payments Content */}
      {payments.length === 0 ? (
        <div className="services-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <CreditCard size={48} />
            </div>
            <h3 className="empty-state-title">No Payments Found</h3>
            <p className="empty-state-description">
              No payments have been processed for your salon yet. Once customers make payments, they will appear here.
            </p>
            <button
              onClick={fetchPayments}
              className="btn btn-primary"
            >
              <RefreshCw size={16} />
              Refresh Payments
            </button>
          </div>
        </div>
      ) : (
        <div className="services-content">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Recent Payments ({payments.length})</h3>
              <div className="header-badge">
                <TrendingUp size={16} />
                <span>Live Data</span>
              </div>
            </div>
            
            <div className="services-table-container">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Payment Details</th>
                    <th>Booking ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>User ID</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="service-row">
                      <td className="service-info">
                        <div className="service-image-container">
                          <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#047857'
                          }}>
                            <CreditCard size={20} />
                          </div>
                        </div>
                        <div className="service-details">
                          <div className="service-name">Payment #{payment.id}</div>
                          <div className="service-description">
                            Transaction ID: {payment.transactionId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="service-category">
                        <div className="category-badge">
                          <BarChart3 size={12} />
                          <span>#{payment.bookingId}</span>
                        </div>
                      </td>
                      
                      <td className="service-price">
                        <span className="price-value">₹{payment.amount || 0}</span>
                      </td>
                      
                      <td className="service-category">
                        <div className="category-badge">
                          <CreditCard size={12} />
                          <span>{payment.paymentMethod || 'N/A'}</span>
                        </div>
                      </td>
                      
                      <td className="service-category">
                        <div className={`category-badge ${
                          payment.status === 'SUCCESS' ? 'category-badge-success' :
                          payment.status === 'PENDING' ? 'category-badge-warning' :
                          'category-badge-error'
                        }`}>
                          {getStatusIcon(payment.status)}
                          <span>{payment.status}</span>
                        </div>
                      </td>
                      
                      <td className="service-category">
                        <div className="category-badge">
                          <Users size={12} />
                          <span>#{payment.userId}</span>
                        </div>
                      </td>

                      <td className="service-duration">
                        <div className="duration-badge">
                          <Calendar size={14} />
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                      </td>
                      
                      <td className="service-actions">
                        <div className="action-buttons">
                          <button
                            onClick={() => console.log("Payment details:", payment)}
                            className="action-btn edit"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="services-content" style={{ marginTop: '1rem' }}>
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
            <div className="header-badge">
              <Filter size={16} />
              <span>Tools</span>
            </div>
          </div>
          
          <div style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={() => alert("Export functionality coming soon!")}
              className="btn btn-secondary"
            >
              <Download size={16} />
              Export Report
            </button>
            
            <button
              onClick={fetchPayments}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
            
            <button
              onClick={() => alert("Analytics coming soon!")}
              className="btn btn-primary"
            >
              <BarChart3 size={16} />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}