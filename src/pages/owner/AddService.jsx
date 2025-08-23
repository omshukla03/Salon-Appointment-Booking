// src/pages/owner/AddService.jsx - Professional Redesign

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, Eye, Save, X, CheckCircle, AlertCircle, Upload, Image as ImageIcon,
  Scissors, Droplets, Hand, User, Heart, Palette, Sparkles
} from "lucide-react";
import { getCurrentSalonId, isPartnerAuthenticated, makeAuthenticatedRequest } from "../../utils/authUtils";
import "./services.css";

export default function AddService() {
  const navigate = useNavigate();
  
  // Get salon ID from authentication data
  const salonId = getCurrentSalonId();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    image: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication on component mount
  useState(() => {
    if (!isPartnerAuthenticated() || !salonId) {
      navigate("/partner/login");
      return;
    }
  }, []);

  const categories = [
    { value: "1", label: "Hair Care", icon: Scissors },
    { value: "2", label: "Skin Care", icon: Droplets },
    { value: "3", label: "Nail Care", icon: Hand },
    { value: "4", label: "Body Care", icon: User },
    { value: "5", label: "Massage", icon: Heart },
    { value: "6", label: "Makeup", icon: Palette },
    { value: "7", label: "Other", icon: Sparkles }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.price.trim() || !formData.duration.trim()) {
      setError("Please fill in all required fields (Name, Price, Duration)");
      return;
    }

    // Validate price and duration are numbers
    if (isNaN(formData.price) || isNaN(formData.duration)) {
      setError("Price and duration must be valid numbers");
      return;
    }

    if (parseFloat(formData.price) <= 0 || parseInt(formData.duration) <= 0) {
      setError("Price and duration must be greater than 0");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare service data with salon ID
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category.trim() ? parseInt(formData.category) : 1,
        image: formData.image.trim(),
        salonId: parseInt(salonId)
      };

      console.log("Adding service for salon:", salonId, serviceData);

      const response = await makeAuthenticatedRequest(
        "http://localhost:5004/api/service-offering/salon-owner",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      console.log("Service added successfully:", result);
      setSuccess("Service added successfully! Redirecting...");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "",
        image: ""
      });

      // Navigate to services page after a delay
      setTimeout(() => {
        navigate("/dashboard/services");
      }, 2000);

    } catch (err) {
      console.error("Error adding service:", err);
      setError(err.message || "Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  return (
    <div className="services-page fade-in">
      {/* Page Header */}
      <div className="services-header">
        <div className="header-content">
          <div className="header-info">
            <button
              onClick={() => navigate("/dashboard/services")}
              className="btn btn-secondary mb-4"
            >
              <ArrowLeft size={16} />
              Back to Services
            </button>
            <h1 className="page-title gradient-text">Add New Service</h1>
            <p className="page-subtitle">Create a new service offering for your salon</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="services-content">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Service Details</h3>
            <div className="header-badge">
              <Plus size={16} />
              <span>New Service</span>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Error Message */}
            {error && (
              <div className="error-container" style={{ 
                marginBottom: '2rem', 
                minHeight: 'auto', 
                padding: '1rem', 
                background: 'rgba(252, 165, 165, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}>
                <div className="error-icon" style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={20} />
                </div>
                <p className="error-message" style={{ margin: '0', fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div style={{ 
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(167, 243, 208, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#047857'
                }}>
                  <CheckCircle size={20} />
                </div>
                <p style={{ margin: '0', fontSize: '0.875rem', color: '#047857', fontWeight: '600' }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Service Name & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="e.g., Premium Haircut & Styling"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(209, 213, 219, 0.8)',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = '2px solid #3b82f6';
                      e.target.style.outlineOffset = '2px';
                      e.target.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(209, 213, 219, 0.8)',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = '2px solid #3b82f6';
                      e.target.style.outlineOffset = '2px';
                      e.target.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows="4"
                  placeholder="Describe your service in detail... What makes it special?"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '1px solid rgba(209, 213, 219, 0.8)',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = '2px solid #3b82f6';
                    e.target.style.outlineOffset = '2px';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                  }}
                />
              </div>

              {/* Price & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min="1"
                    step="0.01"
                    placeholder="500"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(209, 213, 219, 0.8)',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = '2px solid #3b82f6';
                      e.target.style.outlineOffset = '2px';
                      e.target.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min="1"
                    placeholder="60"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(209, 213, 219, 0.8)',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = '2px solid #3b82f6';
                      e.target.style.outlineOffset = '2px';
                      e.target.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                    }}
                  />
                </div>
              </div>

              {/* Service Image */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Service Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://example.com/service-image.jpg"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '1px solid rgba(209, 213, 219, 0.8)',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = '2px solid #3b82f6';
                    e.target.style.outlineOffset = '2px';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                  }}
                />
                {formData.image && (
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={formData.image}
                      alt="Service preview"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '0.75rem',
                        border: '2px solid rgba(226, 232, 240, 0.8)',
                        transition: 'all 0.2s ease'
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-service.jpg';
                      }}
                    />
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <ImageIcon size={16} />
                        <span style={{ fontWeight: '600' }}>Image Preview</span>
                      </div>
                      <p style={{ margin: '0' }}>Image loaded successfully</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Preview */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Eye size={20} color="#3b82f6" />
                  <h4 style={{ 
                    margin: '0', 
                    fontSize: '1.125rem', 
                    fontWeight: '700', 
                    color: '#1f2937' 
                  }}>
                    Service Preview
                  </h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {formData.name || "Service name will appear here"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: '700', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{formData.price || "0"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {formData.duration || "0"} minutes
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {selectedCategory ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <selectedCategory.icon size={16} />
                          {selectedCategory.label}
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Scissors size={16} />
                          Hair Care (default)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: '1' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
                      Adding Service...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Add Service
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/services")}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}