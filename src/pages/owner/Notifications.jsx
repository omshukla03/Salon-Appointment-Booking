import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Bell, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  CreditCard,
  MapPin,
  Phone,
  DollarSign,
  Star,
  Gift,
  Zap,
  TrendingUp,
  UserCheck,
  Copy,
  X,
  Info,
  AlertTriangle
} from "lucide-react";
import { getCurrentSalonId, makeAuthenticatedRequest } from "../../utils/authUtils";

// Enhanced Alert Component Styles (embedded)
const alertStyles = `
/* Enhanced Alert System Styles */

/* Modal animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Alert modal container */
.alert-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  animation: backdropFadeIn 0.2s ease-out;
}

/* Alert modal */
.alert-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

/* Alert header variants */
.alert-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid;
}

.alert-header.success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-bottom-color: #a7f3d0;
  color: #065f46;
}

.alert-header.error {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-bottom-color: #fca5a5;
  color: #991b1b;
}

.alert-header.warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fde68a 100%);
  border-bottom-color: #fcd34d;
  color: #92400e;
}

.alert-header.confirm {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border-bottom-color: #fdba74;
  color: #c2410c;
}

.alert-header.info {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-bottom-color: #93c5fd;
  color: #1d4ed8;
}

/* Alert icon */
.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.alert-icon.success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.alert-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.alert-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.alert-icon.confirm {
  background: rgba(249, 115, 22, 0.1);
  color: #ea580c;
}

.alert-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

/* Alert title */
.alert-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

/* Close button */
.alert-close {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

/* Alert content */
.alert-content {
  padding: 1.5rem;
}

.alert-message {
  color: #374151;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* Alert details box */
.alert-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.alert-details.success {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.alert-details.error {
  background: #fef2f2;
  border-color: #fca5a5;
}

.alert-details.warning {
  background: #fffbeb;
  border-color: #fcd34d;
}

.alert-details.info {
  background: #eff6ff;
  border-color: #93c5fd;
}

.alert-details-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding-right: 2.5rem;
}

/* Copy button */
.alert-copy-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.alert-copy-btn:hover {
  background: white;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Alert footer */
.alert-footer {
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Alert buttons */
.alert-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-btn.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.alert-btn.primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.alert-btn.success {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
}

.alert-btn.success:hover {
  background: #15803d;
  border-color: #15803d;
}

.alert-btn.error {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.alert-btn.error:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.alert-btn.warning {
  background: #d97706;
  color: white;
  border-color: #d97706;
}

.alert-btn.warning:hover {
  background: #b45309;
  border-color: #b45309;
}

.alert-btn.secondary {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.alert-btn.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive design */
@media (max-width: 640px) {
  .alert-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .alert-header,
  .alert-content,
  .alert-footer {
    padding: 1rem;
  }
  
  .alert-footer {
    flex-direction: column;
  }
  
  .alert-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Loading state */
.alert-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert-btn.loading:hover {
  background: inherit;
  border-color: inherit;
}

/* Fade animations */
.fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast-style notifications (for quick messages) */
.toast-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  max-width: 400px;
  border-left: 4px solid;
  animation: slideInRight 0.3s ease-out;
}

.toast-notification.success {
  border-left-color: #16a34a;
}

.toast-notification.error {
  border-left-color: #dc2626;
}

.toast-notification.warning {
  border-left-color: #d97706;
}

.toast-notification.info {
  border-left-color: #2563eb;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .alert-modal {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .alert-header.success {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  }
  
  .alert-header.error {
    background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
  }
  
  .alert-header.warning {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  }
  
  .alert-header.info {
    background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
  }
  
  .alert-details {
    background: #374151;
    border-color: #4b5563;
  }
  
  .alert-footer {
    background: #374151;
    border-color: #4b5563;
  }
}
`;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [markingAsRead, setMarkingAsRead] = useState(null);
  
  // Alert system state
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
    title: '',
    message: '',
    details: '',
    onConfirm: null,
    onCancel: null,
    showCopy: false
  });

  // Inject styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = alertStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds to get real-time updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced alert system functions
  const showAlert = (config) => {
    setAlertConfig({
      show: true,
      type: 'info',
      title: '',
      message: '',
      details: '',
      onConfirm: null,
      onCancel: null,
      showCopy: false,
      ...config
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, show: false }));
  };

  const showSuccessAlert = (title, message, details = '') => {
    showAlert({
      type: 'success',
      title,
      message,
      details,
      showCopy: !!details
    });
  };

  const showErrorAlert = (title, message, details = '') => {
    showAlert({
      type: 'error',
      title,
      message,
      details
    });
  };

  const showConfirmAlert = (title, message, onConfirm, onCancel = null) => {
    showAlert({
      type: 'confirm',
      title,
      message,
      onConfirm,
      onCancel: onCancel || hideAlert
    });
  };

  const showInfoAlert = (title, message, details = '') => {
    showAlert({
      type: 'info',
      title,
      message,
      details,
      showCopy: !!details
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessAlert('Copied!', 'Content has been copied to clipboard');
    } catch (err) {
      showErrorAlert('Copy Failed', 'Unable to copy to clipboard');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentSalonId = getCurrentSalonId();
      if (!currentSalonId) {
        throw new Error("Salon ID not found. Please login again.");
      }

      // Fetch both bookings and payments in parallel
      const [bookingsResponse, paymentsResponse] = await Promise.allSettled([
        axios.get(`http://localhost:5005/api/bookings/salon/${currentSalonId}`),
        makeAuthenticatedRequest(`http://localhost:5006/api/payments/salon/${currentSalonId}`, { method: 'GET' })
          .then(res => res.json())
          .catch(() => []) // If payments fail, return empty array
      ]);

      console.log("API responses:", { bookingsResponse, paymentsResponse });

      // Process bookings
      let bookings = [];
      if (bookingsResponse.status === 'fulfilled') {
        const bookingData = bookingsResponse.value.data;
        
        // Handle different response structures
        if (Array.isArray(bookingData)) {
          bookings = bookingData;
        } else if (bookingData && typeof bookingData === 'object') {
          if (bookingData.bookings && Array.isArray(bookingData.bookings)) {
            bookings = bookingData.bookings;
          } else if (bookingData.data && Array.isArray(bookingData.data)) {
            bookings = bookingData.data;
          } else {
            // If it's an object with keys, try to extract values
            bookings = Object.values(bookingData).filter(item => 
              item && typeof item === 'object' && item.id
            );
          }
        }
      }

      // Process payments
      let payments = [];
      if (paymentsResponse.status === 'fulfilled') {
        const paymentData = paymentsResponse.value;
        payments = Array.isArray(paymentData) ? paymentData : [];
      }

      // Create booking notifications
      const bookingNotifications = bookings.map((booking) => ({
        id: `booking-${booking.id}`,
        type: getBookingNotificationType(booking.status),
        category: 'booking',
        title: `Booking #${booking.id}`,
        message: getBookingNotificationMessage(booking),
        service: booking.serviceIds?.length
          ? `${booking.serviceIds.length} service${booking.serviceIds.length > 1 ? 's' : ''} selected`
          : "No services selected",
        customer: booking.customerName || `Customer ID: ${booking.customerId}`,
        customerPhone: booking.customerPhone,
        time: `${formatDateTime(booking.startTime)} → ${formatDateTime(booking.endTime)}`,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        totalPrice: booking.totalPrice || 0,
        isRead: booking.notificationRead || false,
        createdAt: booking.createdAt || booking.startTime,
        priority: getBookingPriority(booking.status, booking.paymentStatus),
        bookingId: booking.id,
        relatedData: booking
      }));

      // Create payment notifications
      const paymentNotifications = payments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: getPaymentNotificationType(payment.status),
        category: 'payment',
        title: `Payment #${payment.id}`,
        message: getPaymentNotificationMessage(payment),
        service: `Payment for Booking #${payment.bookingId}`,
        customer: `User #${payment.userId}`,
        customerPhone: null,
        time: formatDateTime(payment.createdAt),
        status: payment.status,
        paymentStatus: payment.status,
        paymentMethod: payment.paymentMethod,
        totalPrice: payment.amount || 0,
        isRead: payment.notificationRead || false,
        createdAt: payment.createdAt,
        priority: getPaymentPriority(payment.status),
        bookingId: payment.bookingId,
        relatedData: payment
      }));

      // Combine and sort notifications
      const allNotifications = [...bookingNotifications, ...paymentNotifications];
      
      const sorted = allNotifications.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotifications(sorted);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const getBookingNotificationType = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'info';
    }
  };

  const getPaymentNotificationType = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  const getBookingNotificationMessage = (booking) => {
    const statusMessages = {
      'pending': '🔔 New booking request awaiting confirmation',
      'confirmed': '✅ Booking confirmed and scheduled',
      'completed': '🎉 Service completed successfully',
      'cancelled': '❌ Booking has been cancelled'
    };

    let message = statusMessages[booking.status?.toLowerCase()] || `📋 Booking status: ${booking.status}`;
    
    if (booking.paymentStatus === 'PENDING_SALON_PAYMENT') {
      message += ' • 💳 Payment due at salon';
    } else if (booking.paymentStatus === 'COMPLETED') {
      message += ' • 💰 Payment received';
    }

    return message;
  };

  const getPaymentNotificationMessage = (payment) => {
    const statusMessages = {
      'success': '💰 Payment processed successfully',
      'completed': '💰 Payment completed successfully', 
      'pending': '⏳ Payment is being processed',
      'failed': '❌ Payment failed'
    };

    return statusMessages[payment.status?.toLowerCase()] || `💳 Payment status: ${payment.status}`;
  };

  const getBookingPriority = (status, paymentStatus) => {
    if (status === 'pending') return 1;
    if (paymentStatus === 'PENDING_SALON_PAYMENT') return 2;
    if (status === 'cancelled') return 3;
    return 4;
  };

  const getPaymentPriority = (status) => {
    if (status === 'pending') return 1;
    if (status === 'failed') return 2;
    if (status === 'success' || status === 'completed') return 3;
    return 4;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Invalid Date';
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

  const getStatusIcon = (notification) => {
    if (notification.category === 'payment') {
      switch (notification.type) {
        case 'success': return <CreditCard className="text-green-500" size={20} />;
        case 'warning': return <Clock className="text-yellow-500" size={20} />;
        case 'error': return <XCircle className="text-red-500" size={20} />;
        default: return <CreditCard className="text-blue-500" size={20} />;
      }
    }
    
    // Booking notifications
    switch (notification.type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      default: return <Bell className="text-blue-500" size={20} />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'payment': return <CreditCard size={16} />;
      case 'booking': return <Calendar size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const markAsRead = async (notificationId) => {
    setMarkingAsRead(notificationId);
    
    // Simulate API call to mark as read
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? {...n, isRead: true} : n)
      );
      setMarkingAsRead(null);
      showSuccessAlert('Marked as Read!', 'Notification has been marked as read');
    }, 500);
  };

  const deleteNotification = (notificationId) => {
    showConfirmAlert(
      'Delete Notification',
      'Are you sure you want to delete this notification? This action cannot be undone.',
      () => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        showSuccessAlert('Deleted!', 'Notification has been deleted successfully');
        hideAlert();
      }
    );
  };

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.isRead);
    if (filter === "booking") return notifications.filter(n => n.category === 'booking');
    if (filter === "payment") return notifications.filter(n => n.category === 'payment');
    return notifications.filter(n => n.type === filter);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const bookingCount = notifications.filter(n => n.category === 'booking').length;
  const paymentCount = notifications.filter(n => n.category === 'payment').length;

  // Enhanced Alert Modal Component
  const AlertModal = () => {
    if (!alertConfig.show) return null;

    const getAlertIcon = () => {
      switch (alertConfig.type) {
        case 'success': return <CheckCircle size={24} />;
        case 'error': return <XCircle size={24} />;
        case 'warning': return <AlertTriangle size={24} />;
        case 'confirm': return <AlertCircle size={24} />;
        case 'info': return <Info size={24} />;
        default: return <Info size={24} />;
      }
    };

    return (
      <div className="alert-modal-overlay" onClick={alertConfig.type !== 'confirm' ? hideAlert : undefined}>
        <div className="alert-modal" onClick={e => e.stopPropagation()}>
          <div className={`alert-header ${alertConfig.type}`}>
            <div className={`alert-icon ${alertConfig.type}`}>
              {getAlertIcon()}
            </div>
            <h3 className="alert-title">{alertConfig.title}</h3>
            {alertConfig.type !== 'confirm' && (
              <button onClick={hideAlert} className="alert-close">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="alert-content">
            <p className="alert-message">{alertConfig.message}</p>
            
            {alertConfig.details && (
              <div className={`alert-details ${alertConfig.type}`}>
                <pre className="alert-details-text">{alertConfig.details}</pre>
                {alertConfig.showCopy && (
                  <button
                    onClick={() => copyToClipboard(alertConfig.details)}
                    className="alert-copy-btn"
                    title="Copy details"
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="alert-footer">
            {alertConfig.type === 'confirm' ? (
              <>
                <button
                  onClick={alertConfig.onCancel || hideAlert}
                  className="alert-btn secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={alertConfig.onConfirm}
                  className="alert-btn warning"
                >
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={hideAlert}
                className={`alert-btn ${alertConfig.type}`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="owner-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading notifications...</span>
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
            <h3 className="font-semibold mb-2">Error Loading Notifications</h3>
            <p className="mb-4">{error}</p>
            <button onClick={fetchNotifications} className="btn btn-danger">
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="content-card mb-8">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="stats-icon blue">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="card-title">Notifications Center</h2>
              <p className="text-sm text-gray-600 mt-1">
                Real-time updates for bookings and payments
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Notifications ({notifications.length})</option>
                <option value="unread">Unread Only ({unreadCount})</option>
                <option value="booking">Bookings ({bookingCount})</option>
                <option value="payment">Payments ({paymentCount})</option>
                <option value="success">Success</option>
                <option value="warning">Pending</option>
                <option value="error">Issues</option>
              </select>
            </div>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
            <Bell size={24} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Bookings</p>
              <p className="text-2xl font-bold">{bookingCount}</p>
            </div>
            <Calendar size={24} className="text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Payments</p>
              <p className="text-2xl font-bold">{paymentCount}</p>
            </div>
            <CreditCard size={24} className="text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Unread</p>
              <p className="text-2xl font-bold">{unreadCount}</p>
            </div>
            <AlertCircle size={24} className="text-orange-200" />
          </div>
        </div>
      </div>

      {getFilteredNotifications().length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Bell size={48} />
            </div>
            <h3 className="empty-state-title">
              {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
            </h3>
            <p className="empty-state-description">
              {filter === "all" 
                ? "Notifications will appear here when there are updates to your bookings and payments."
                : `No notifications match the ${filter} filter.`
              }
            </p>
            <button onClick={fetchNotifications} className="btn btn-primary">
              <RefreshCw size={16} />
              Refresh Notifications
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredNotifications().map((notification) => (
            <div
              key={notification.id}
              className={`booking-card ${!notification.isRead ? 'border-l-4 border-blue-500' : ''} fade-in`}
            >
              <div className="booking-header">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(notification)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`booking-id ${!notification.isRead ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.category === 'booking' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getCategoryIcon(notification.category)}
                            <span className="ml-1 capitalize">{notification.category}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-badge ${notification.status?.toLowerCase()}`}>
                          {notification.status}
                        </span>
                        {notification.paymentStatus && notification.category === 'booking' && (
                          <span className={`status-badge payment-${notification.paymentStatus?.toLowerCase().replace('_', '-')}`}>
                            {notification.paymentStatus === 'PENDING_SALON_PAYMENT' ? 'Pay at Salon' : notification.paymentStatus}
                          </span>
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} />
                    <span className="font-medium">Customer:</span>
                    <span>{notification.customer}</span>
                  </div>
                  {notification.customerPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} />
                      <span>{notification.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} />
                    <span className="font-medium">Service:</span>
                    <span>{notification.service}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} />
                    <span className="font-medium">Time:</span>
                    <span>{notification.time}</span>
                  </div>
                  {notification.paymentMethod && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard size={14} />
                      <span className="font-medium">Payment:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        notification.paymentMethod === 'PAY_AT_SALON' ? 'bg-orange-100 text-orange-800' :
                        notification.paymentMethod === 'RAZORPAY' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.paymentMethod === 'PAY_AT_SALON' ? 'Pay at Salon' : notification.paymentMethod}
                      </span>
                    </div>
                  )}
                  {notification.totalPrice > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={14} />
                      <span className="font-medium">Amount:</span>
                      <span className="font-bold text-green-600">₹{notification.totalPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="action-buttons mt-4">
                <button
                  onClick={() => {
                    const details = `
${notification.category.toUpperCase()} NOTIFICATION

${notification.title}
Customer: ${notification.customer}
${notification.customerPhone ? `Phone: ${notification.customerPhone}` : ''}
Service: ${notification.service}
Time: ${notification.time}
Status: ${notification.status}
${notification.paymentMethod ? `Payment Method: ${notification.paymentMethod}` : ''}
${notification.paymentStatus ? `Payment Status: ${notification.paymentStatus}` : ''}
${notification.totalPrice ? `Amount: ₹${notification.totalPrice}` : ''}
${notification.bookingId ? `Related Booking: #${notification.bookingId}` : ''}

Message: ${notification.message}
                    `.trim();
                    
                    showInfoAlert(
                      `${notification.title} Details`,
                      notification.message,
                      details
                    );
                  }}
                  className="action-btn info"
                >
                  <Eye size={16} />
                  View Details
                </button>
                
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    disabled={markingAsRead === notification.id}
                    className="action-btn success"
                  >
                    {markingAsRead === notification.id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Mark as Read
                  </button>
                )}
                
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="action-btn warning"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>

              {(notification.paymentStatus === 'PENDING_SALON_PAYMENT' || 
                (notification.category === 'payment' && notification.status === 'PENDING')) && (
                <div className="alert warning mt-4">
                  <AlertCircle size={16} />
                  <div>
                    <p className="font-medium">
                      {notification.category === 'payment' ? 'Payment Processing' : 'Payment Required'}
                    </p>
                    <p className="text-sm">
                      {notification.category === 'payment' 
                        ? `Payment of ₹${notification.totalPrice} is being processed.`
                        : `Customer will pay ₹${notification.totalPrice} when they arrive for their appointment.`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Alert Modal */}
      <AlertModal />
    </div>
  );
}