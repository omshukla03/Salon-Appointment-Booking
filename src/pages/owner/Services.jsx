// src/pages/owner/Services.jsx - Professional Redesign

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit, Plus, RefreshCw, Scissors, Clock, Tag, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { getCurrentSalonId, isPartnerAuthenticated, makeAuthenticatedRequest } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";
import "./services.css";

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get salon ID from authentication data
  const salonId = getCurrentSalonId();

  useEffect(() => {
    // Check if user is authenticated and has salon ID
    if (!isPartnerAuthenticated() || !salonId) {
      console.error("No salon ID found or user not authenticated");
      setError("Please login as a partner to view services");
      navigate("/partner/login");
      return;
    }

    fetchServices();
  }, [salonId, navigate]);

  const fetchServices = async () => {
    if (!salonId) {
      setError("Salon ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching services for salon:", salonId);
      
      // Use the utility function for authenticated requests
      const response = await makeAuthenticatedRequest(
        `http://localhost:5004/api/service-offering/salon/${salonId}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      console.log("✅ Services data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      setServices(data || []);
    } catch (err) {
      console.error("❌ Error fetching services:", err);
      setError("Failed to fetch services. Please try again.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting service:", serviceId, "for salon:", salonId);
      
      const response = await makeAuthenticatedRequest(
        `http://localhost:5004/api/service-offering/${serviceId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      console.log("✅ Service deleted successfully");
      await fetchServices(); // Reload services after deletion
    } catch (err) {
      console.error("❌ Error deleting service:", err);
      alert(`Failed to delete service: ${err.message}`);
    }
  };

  const handleEdit = (service) => {
    // Navigate to edit service page or open edit modal
    console.log("✏️ Edit service:", service);
    // You can implement edit functionality here
    alert("Edit functionality coming soon!");
  };

  // Calculate statistics
  const getStatistics = () => {
    if (services.length === 0) return { avgPrice: 0, avgDuration: 0, totalCategories: 0 };
    
    const avgPrice = Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length);
    const avgDuration = Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length);
    const categories = [...new Set(services.map(s => s.category || 'General'))];
    
    return { avgPrice, avgDuration, totalCategories: categories.length };
  };

  const stats = getStatistics();

  // Show error state
  if (error) {
    return (
      <div className="services-page">
        <div className="error-container">
          <div className="error-icon">
            <BarChart3 size={48} />
          </div>
          <h3 className="error-title">Error Loading Services</h3>
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
          <span className="loading-text">Loading your services...</span>
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
            <h1 className="page-title gradient-text">Services Management</h1>
            <p className="page-subtitle">Manage your salon's service offerings and pricing</p>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchServices}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate("/dashboard/add-service")}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Service
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="services-stats">
        <div className="stats-card">
          <div className="stats-icon blue">
            <Scissors size={24} />
          </div>
          <div className="stats-content">
            <h3>Total Services</h3>
            <div className="stats-value">{services.length}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stats-content">
            <h3>Average Price</h3>
            <div className="stats-value">₹{stats.avgPrice}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon purple">
            <Clock size={24} />
          </div>
          <div className="stats-content">
            <h3>Average Duration</h3>
            <div className="stats-value">{stats.avgDuration} min</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon indigo">
            <Tag size={24} />
          </div>
          <div className="stats-content">
            <h3>Categories</h3>
            <div className="stats-value">{stats.totalCategories}</div>
          </div>
        </div>
      </div>

      {/* Services Content */}
      {services.length === 0 ? (
        <div className="services-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Scissors size={48} />
            </div>
            <h3 className="empty-state-title">No Services Found</h3>
            <p className="empty-state-description">
              Start by adding your first service to attract customers and showcase your expertise.
            </p>
            <button
              onClick={() => navigate("/dashboard/add-service")}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Your First Service
            </button>
          </div>
        </div>
      ) : (
        <div className="services-content">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Your Services ({services.length})</h3>
              <div className="header-badge">
                <TrendingUp size={16} />
                <span>Active</span>
              </div>
            </div>
            
            <div className="services-table-container">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="service-row">
                      <td className="service-info">
                        <div className="service-image-container">
                          <img 
                            src={service.image || '/placeholder-service.jpg'} 
                            alt={service.name}
                            className="service-image"
                            onError={(e) => {
                              e.target.src = '/placeholder-service.jpg';
                            }}
                          />
                        </div>
                        <div className="service-details">
                          <div className="service-name">{service.name}</div>
                          {service.description && (
                            <div className="service-description">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="service-price">
                        <span className="price-value">₹{service.price}</span>
                      </td>
                      
                      <td className="service-duration">
                        <div className="duration-badge">
                          <Clock size={14} />
                          <span>{service.duration} min</span>
                        </div>
                      </td>
                      
                      <td className="service-category">
                        <div className="category-badge">
                          <Tag size={12} />
                          <span>{service.category || 'General'}</span>
                        </div>
                      </td>
                      
                      <td className="service-actions">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(service)}
                            className="action-btn edit"
                            title="Edit Service"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="action-btn delete"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
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