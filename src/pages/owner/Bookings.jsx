// src/pages/owner/Bookings.jsx - Enhanced Professional Component with Details Modal

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  Settings,
  Filter,
  Search,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  X,
  Copy,
  Download,
  Share2,
  CreditCard,
  Hash,
  Users,
  Tag,
  FileText,
  Star
} from "lucide-react";
import { getCurrentSalonId, getCurrentSalon, isPartnerAuthenticated } from "../../utils/authUtils";
import "./bookings.css";

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [salonId, setSalonId] = useState(null);
  const [salon, setSalon] = useState(null);

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
    
    loadBookings();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [navigate]);

  const loadBookings = async () => {
    const currentSalonId = getCurrentSalonId();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5005/api/bookings/salon/${currentSalonId}`);
      
      let bookingsArray = [];
      if (Array.isArray(response.data)) {
        bookingsArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.bookings && Array.isArray(response.data.bookings)) {
          bookingsArray = response.data.bookings;
        } else {
          bookingsArray = Object.values(response.data);
        }
      }
      
      // Normalize booking data
      const normalizedBookings = bookingsArray.map(booking => ({
        ...booking,
        status: booking.status || 'PENDING',
        customerName: booking.customerName || booking.customer?.name || `Customer #${booking.customerId}`,
        customerEmail: booking.customerEmail || booking.customer?.email,
        customerPhone: booking.customerPhone || booking.customer?.phone,
        totalPrice: booking.totalPrice || 0,
        serviceIds: booking.serviceIds || []
      }));
      
      setBookings(normalizedBookings);
    } catch (err) {
      console.error("Error fetching salon bookings:", err);
      
      let errorMessage = "Failed to fetch bookings";
      if (err.response?.status === 404) {
        errorMessage = "No bookings found for this salon";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error - please try again later";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setError(null);
      
      const response = await axios.patch(`http://localhost:5005/api/bookings/${bookingId}/status`, {
        status: newStatus.toUpperCase()
      });
      
      // Update the booking in local state immediately
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus.toUpperCase() }
            : booking
        )
      );
      
      // Update selected booking if it's open
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus.toUpperCase() }));
      }
      
      // Show success notification
      const statusText = newStatus.toLowerCase();
      alert(`Booking #${bookingId} has been ${statusText} successfully!`);
      
    } catch (err) {
      console.error("Error updating booking status:", err);
      
      let errorMessage = "Failed to update booking";
      if (err.response?.status === 404) {
        errorMessage = "Booking not found";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid status value";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDetailedDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid Date";
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'cancelled':
        return XCircle;
      case 'completed':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getFilteredAndSortedBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => 
        booking.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toString().includes(searchTerm) ||
        (booking.customerEmail && booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.customerPhone && booking.customerPhone.includes(searchTerm))
      );
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime);
        case "oldest":
          return new Date(a.createdAt || a.startTime) - new Date(b.createdAt || b.startTime);
        case "price-high":
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case "price-low":
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        case "date":
          return new Date(a.startTime) - new Date(b.startTime);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Details Modal Component
  const DetailsModal = ({ booking, onClose, onStatusUpdate }) => {
    if (!booking) return null;

    const StatusIcon = getStatusIcon(booking.status);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="details-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-content">
              <div className="modal-title-section">
                <Hash className="modal-icon" size={24} />
                <div>
                  <h2 className="modal-title">Booking #{booking.id}</h2>
                  <p className="modal-subtitle">Detailed Information</p>
                </div>
              </div>
              <div className="modal-header-actions">
                <div className={`status-badge-large ${getStatusColor(booking.status)}`}>
                  <StatusIcon size={16} />
                  <span>{booking.status}</span>
                </div>
                <button onClick={onClose} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="modal-content">
            {/* Customer Information */}
            <div className="detail-section">
              <div className="section-header">
                <User className="section-icon" size={20} />
                <h3>Customer Information</h3>
              </div>
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="field-label">Name</span>
                  <span className="field-value">{booking.customerName}</span>
                  <button 
                    onClick={() => copyToClipboard(booking.customerName)}
                    className="copy-btn"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                {booking.customerEmail && (
                  <div className="detail-field">
                    <span className="field-label">Email</span>
                    <span className="field-value">{booking.customerEmail}</span>
                    <button 
                      onClick={() => copyToClipboard(booking.customerEmail)}
                      className="copy-btn"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {booking.customerPhone && (
                  <div className="detail-field">
                    <span className="field-label">Phone</span>
                    <span className="field-value">{booking.customerPhone}</span>
                    <button 
                      onClick={() => copyToClipboard(booking.customerPhone)}
                      className="copy-btn"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                <div className="detail-field">
                  <span className="field-label">Customer ID</span>
                  <span className="field-value">#{booking.customerId}</span>
                  <button 
                    onClick={() => copyToClipboard(booking.customerId.toString())}
                    className="copy-btn"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="detail-section">
              <div className="section-header">
                <Calendar className="section-icon" size={20} />
                <h3>Booking Details</h3>
              </div>
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="field-label">Start Time</span>
                  <span className="field-value">{formatDetailedDate(booking.startTime)}</span>
                </div>
                <div className="detail-field">
                  <span className="field-label">End Time</span>
                  <span className="field-value">{formatDetailedDate(booking.endTime)}</span>
                </div>
                <div className="detail-field">
                  <span className="field-label">Created</span>
                  <span className="field-value">{formatDetailedDate(booking.createdAt)}</span>
                </div>
                <div className="detail-field">
                  <span className="field-label">Duration</span>
                  <span className="field-value">
                    {booking.startTime && booking.endTime ? 
                      `${Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60))} minutes` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="detail-section">
              <div className="section-header">
                <Settings className="section-icon" size={20} />
                <h3>Services</h3>
              </div>
              <div className="services-info">
                <div className="service-count">
                  <span className="count-badge">{booking.serviceIds.length}</span>
                  <span>Services Selected</span>
                </div>
                {booking.serviceIds.length > 0 && (
                  <div className="service-ids-list">
                    {booking.serviceIds.map(serviceId => (
                      <div key={serviceId} className="service-id-chip">
                        <Tag size={12} />
                        <span>Service #{serviceId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="detail-section">
              <div className="section-header">
                <CreditCard className="section-icon" size={20} />
                <h3>Payment Information</h3>
              </div>
              <div className="payment-info">
                <div className="price-display">
                  <span className="currency">₹</span>
                  <span className="amount">{booking.totalPrice}</span>
                </div>
                <div className="payment-details">
                  <div className="payment-field">
                    <span className="payment-label">Status</span>
                    <span className="payment-value">
                      {booking.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="payment-field">
                    <span className="payment-label">Method</span>
                    <span className="payment-value">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(booking.notes || booking.specialRequests) && (
              <div className="detail-section">
                <div className="section-header">
                  <FileText className="section-icon" size={20} />
                  <h3>Additional Information</h3>
                </div>
                <div className="notes-section">
                  {booking.notes && (
                    <div className="note-item">
                      <span className="note-label">Notes:</span>
                      <p className="note-content">{booking.notes}</p>
                    </div>
                  )}
                  {booking.specialRequests && (
                    <div className="note-item">
                      <span className="note-label">Special Requests:</span>
                      <p className="note-content">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="footer-actions">
              <div className="quick-actions">
                <button 
                  onClick={() => copyToClipboard(`Booking #${booking.id} - ${booking.customerName} - ₹${booking.totalPrice}`)}
                  className="quick-action-btn"
                >
                  <Copy size={16} />
                  Copy Summary
                </button>
                <button className="quick-action-btn">
                  <Share2 size={16} />
                  Share
                </button>
                <button className="quick-action-btn">
                  <Download size={16} />
                  Export
                </button>
              </div>
              
              <div className="status-actions">
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => onStatusUpdate(booking.id, 'CONFIRMED')}
                      className="action-btn success"
                    >
                      <CheckCircle size={16} />
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => onStatusUpdate(booking.id, 'CANCELLED')}
                      className="action-btn danger"
                    >
                      <XCircle size={16} />
                      Cancel Booking
                    </button>
                  </>
                )}
                
                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => onStatusUpdate(booking.id, 'COMPLETED')}
                    className="action-btn success"
                  >
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingCard = ({ booking }) => {
    const StatusIcon = getStatusIcon(booking.status);
    
    return (
      <div className="booking-card slide-up">
        <div className="booking-header">
          <div className="booking-main-info">
            <h3 className="booking-id">Booking #{booking.id}</h3>
            <div className="customer-info">
              <div className="customer-name">
                <User size={16} />
                <span>{booking.customerName}</span>
              </div>
              {booking.customerEmail && (
                <div className="customer-contact">
                  <Mail size={14} />
                  <span>{booking.customerEmail}</span>
                </div>
              )}
              {booking.customerPhone && (
                <div className="customer-contact">
                  <Phone size={14} />
                  <span>{booking.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="booking-status">
            <div className={`status-badge ${getStatusColor(booking.status)}`}>
              <StatusIcon size={14} />
              <span>{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="booking-details">
          <div className="detail-item">
            <Calendar size={16} />
            <div>
              <span className="detail-label">Start Time</span>
              <span className="detail-value">{formatDate(booking.startTime)}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Clock size={16} />
            <div>
              <span className="detail-label">End Time</span>
              <span className="detail-value">{formatDate(booking.endTime)}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <DollarSign size={16} />
            <div>
              <span className="detail-label">Total Price</span>
              <span className="detail-value">₹{booking.totalPrice}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Settings size={16} />
            <div>
              <span className="detail-label">Services</span>
              <span className="detail-value">{booking.serviceIds.length} selected</span>
            </div>
          </div>
        </div>

        {booking.serviceIds && booking.serviceIds.length > 0 && (
          <div className="service-tags">
            <span className="service-tags-label">Service IDs:</span>
            <div className="service-tags-list">
              {booking.serviceIds.map(serviceId => (
                <span key={serviceId} className="service-tag">
                  #{serviceId}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="booking-actions">
          <div className="booking-meta">
            <span className="created-date">
              Created: {formatDate(booking.createdAt)}
            </span>
          </div>
          
          <div className="action-buttons">
            {booking.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                  className="action-btn success"
                >
                  <CheckCircle size={16} />
                  <span>Confirm</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                  className="action-btn danger"
                >
                  <XCircle size={16} />
                  <span>Cancel</span>
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <button
                onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                className="action-btn success"
              >
                <CheckCircle size={16} />
                <span>Complete</span>
              </button>
            )}
            
            <button
              onClick={() => openDetailsModal(booking)}
              className="action-btn info"
            >
              <Eye size={16} />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredBookings = getFilteredAndSortedBookings();

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="page-title gradient-text">Salon Bookings</h1>
            <div className="header-meta">
              <div className="salon-info">
                <h2 className="salon-name">{salon?.name || 'Your Salon'}</h2>
                <div className="date-time-info">
                  <Calendar size={14} />
                  <span>{formatFullDate(currentTime)}</span>
                  <Clock size={14} />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={loadBookings}
              className="btn btn-primary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-item">
            <div className="stat-icon blue">
              <Calendar size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{bookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon yellow">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{bookings.filter(b => b.status === 'PENDING').length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon green">
              <CheckCircle size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{bookings.filter(b => b.status === 'CONFIRMED').length}</span>
              <span className="stat-label">Confirmed</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon purple">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">₹{bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert error fade-in">
          <AlertTriangle size={20} />
          <div>
            <h3 className="alert-title">Error Loading Bookings</h3>
            <p className="alert-message">{error}</p>
          </div>
          <div className="alert-actions">
            <button onClick={() => setError(null)} className="btn btn-secondary btn-sm">
              Dismiss
            </button>
            <button onClick={loadBookings} className="btn btn-danger btn-sm">
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <ArrowUpDown size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="date">By Date</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-text">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
        {(searchTerm || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Calendar size={64} />
          </div>
          <h3 className="empty-state-title">
            {searchTerm || filterStatus !== 'all' ? 'No Matching Bookings' : 'No Bookings Found'}
          </h3>
          <p className="empty-state-description">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Customer bookings will appear here when they make appointments.'
            }
          </p>
          <div className="empty-state-actions">
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={loadBookings}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              Refresh Bookings
            </button>
          </div>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <DetailsModal 
          booking={selectedBooking} 
          onClose={closeDetailsModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}