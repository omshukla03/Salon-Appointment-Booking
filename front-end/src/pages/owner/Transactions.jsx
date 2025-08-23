// src/pages/owner/Transaction.jsx - Professional Redesign

import { useEffect, useState } from "react";
import { RefreshCw, CreditCard, TrendingUp, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Filter } from "lucide-react";
import { getCurrentSalonId, isPartnerAuthenticated, makeAuthenticatedRequest } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";
import "./services.css";

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get salon ID from authentication data
  const salonId = getCurrentSalonId();

  useEffect(() => {
    // Check if user is authenticated and has salon ID
    if (!isPartnerAuthenticated() || !salonId) {
      console.error("No salon ID found or user not authenticated");
      setError("Please login as a partner to view transactions");
      navigate("/partner/login");
      return;
    }

    fetchTransactions();
  }, [salonId, navigate]);

  const fetchTransactions = async () => {
    if (!salonId) {
      setError("Salon ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("💳 Fetching transactions for salon:", salonId);
      
      const response = await makeAuthenticatedRequest(
        `http://localhost:5006/api/payments/salon/${salonId}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      console.log("✅ Transactions data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      setTransactions(data || []);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalEarning = transactions
    .filter(txn => txn.status === 'SUCCESS')
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  const lastPayment = transactions.length > 0 
    ? transactions[transactions.length - 1].amount || 0 
    : 0;

  const pendingTransactions = transactions.filter(txn => txn.status === 'PENDING').length;
  const failedTransactions = transactions.filter(txn => txn.status === 'FAILED').length;

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
          <h3 className="error-title">Error Loading Transactions</h3>
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
          <span className="loading-text">Loading your transactions...</span>
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
            <h1 className="page-title gradient-text">Transaction History</h1>
            <p className="page-subtitle">Track all your payment transactions and earnings</p>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchTransactions}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => alert("Export functionality coming soon!")}
              className="btn btn-primary"
            >
              <Filter size={16} />
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
            <h3>Total Earnings</h3>
            <div className="stats-value">₹{totalEarning}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon blue">
            <CreditCard size={24} />
          </div>
          <div className="stats-content">
            <h3>Last Payment</h3>
            <div className="stats-value">₹{lastPayment}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="stats-content">
            <h3>Total Transactions</h3>
            <div className="stats-value">{transactions.length}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon indigo">
            <Clock size={24} />
          </div>
          <div className="stats-content">
            <h3>Pending</h3>
            <div className="stats-value">{pendingTransactions}</div>
          </div>
        </div>
      </div>

      {/* Transactions Content */}
      {transactions.length === 0 ? (
        <div className="services-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <CreditCard size={48} />
            </div>
            <h3 className="empty-state-title">No Transactions Found</h3>
            <p className="empty-state-description">
              No transactions have been processed yet. Once customers make payments, they will appear here.
            </p>
            <button
              onClick={fetchTransactions}
              className="btn btn-primary"
            >
              <RefreshCw size={16} />
              Refresh Transactions
            </button>
          </div>
        </div>
      ) : (
        <div className="services-content">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Recent Transactions ({transactions.length})</h3>
              <div className="header-badge">
                <TrendingUp size={16} />
                <span>Live Data</span>
              </div>
            </div>
            
            <div className="services-table-container">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="service-row">
                      <td className="service-info">
                        <div className="service-image-container">
                          <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6'
                          }}>
                            <CreditCard size={20} />
                          </div>
                        </div>
                        <div className="service-details">
                          <div className="service-name">#{txn.id}</div>
                          <div className="service-description">
                            Booking #{txn.bookingId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="service-duration">
                        <div className="duration-badge">
                          <Calendar size={14} />
                          <span>{formatDate(txn.transactionDate || txn.createdAt)}</span>
                        </div>
                      </td>
                      
                      <td className="service-price">
                        <span className="price-value">₹{txn.amount || 0}</span>
                      </td>
                      
                      <td className="service-category">
                        <div className="category-badge">
                          <CreditCard size={12} />
                          <span>{txn.paymentMethod || 'N/A'}</span>
                        </div>
                      </td>
                      
                      <td className="service-category">
                        <div className={`category-badge ${
                          txn.status === 'SUCCESS' ? 'category-badge-success' :
                          txn.status === 'PENDING' ? 'category-badge-warning' :
                          'category-badge-error'
                        }`}>
                          {getStatusIcon(txn.status)}
                          <span>{txn.status}</span>
                        </div>
                      </td>
                      
                      <td className="service-actions">
                        <div className="action-buttons">
                          <button
                            onClick={() => console.log("Transaction details:", txn)}
                            className="action-btn edit"
                            title="View Details"
                          >
                            <TrendingUp size={16} />
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
    </div>
  );
}