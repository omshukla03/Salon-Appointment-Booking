// src/pages/owner/Categories.jsx - Professional Categories Management

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit, Plus, RefreshCw, Tag, Users, Scissors, TrendingUp, BarChart3, X, Check } from "lucide-react";
import { getCurrentSalonId, isPartnerAuthenticated, makeAuthenticatedRequest } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";
import "./categories.css";

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Tag"
  });
  const [submitting, setSubmitting] = useState(false);

  // Get salon ID from authentication data
  const salonId = getCurrentSalonId();

  // Predefined category options with icons
  const categoryOptions = [
    { name: "Hair Care", icon: "Scissors", description: "Hair cutting, styling, coloring and treatments" },
    { name: "Skin Care", icon: "Users", description: "Facial treatments, cleansing and skin rejuvenation" },
    { name: "Nail Care", icon: "Tag", description: "Manicure, pedicure and nail art services" },
    { name: "Body Care", icon: "Users", description: "Body treatments, scrubs and wellness services" },
    { name: "Massage", icon: "Users", description: "Therapeutic and relaxation massage services" },
    { name: "Makeup", icon: "Tag", description: "Professional makeup and beauty services" },
    { name: "Bridal Services", icon: "Users", description: "Complete bridal beauty packages" },
    { name: "Men's Grooming", icon: "Scissors", description: "Specialized services for men" },
    { name: "Spa Treatments", icon: "Users", description: "Premium spa and wellness services" },
    { name: "Beauty Packages", icon: "Tag", description: "Combined service packages and deals" }
  ];

  useEffect(() => {
    // Check if user is authenticated and has salon ID
    if (!isPartnerAuthenticated() || !salonId) {
      console.error("No salon ID found or user not authenticated");
      setError("Please login as a partner to view categories");
      navigate("/partner/login");
      return;
    }

    fetchCategories();
  }, [salonId, navigate]);

  const fetchCategories = async () => {
    if (!salonId) {
      setError("Salon ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching categories for salon:", salonId);
      
      // First, get all services for this salon to extract categories
      const response = await makeAuthenticatedRequest(
        `http://localhost:5004/api/service-offering/salon/${salonId}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      console.log("✅ Services data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      // Extract unique categories from services
      const services = data || [];
      const uniqueCategories = [...new Set(services.map(service => service.category).filter(cat => cat && cat.trim() !== ''))];
      
      // Create category objects with service count
      const categoryData = uniqueCategories.map(categoryName => {
        const servicesInCategory = services.filter(service => service.category === categoryName);
        const categoryInfo = categoryOptions.find(opt => opt.name === categoryName) || {
          name: categoryName,
          icon: "Tag",
          description: "Custom category"
        };
        
        return {
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          description: categoryInfo.description,
          icon: categoryInfo.icon,
          serviceCount: servicesInCategory.length,
          services: servicesInCategory
        };
      });
      
      // Add "General" category if there are services without categories
      const servicesWithoutCategory = services.filter(service => !service.category || service.category.trim() === '');
      if (servicesWithoutCategory.length > 0) {
        categoryData.push({
          id: 'general',
          name: 'General',
          description: 'Services without specific category',
          icon: 'Tag',
          serviceCount: servicesWithoutCategory.length,
          services: servicesWithoutCategory
        });
      }
      
      setCategories(categoryData);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setError("Failed to fetch categories. Please try again.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    
    if (existingCategory) {
      alert("Category already exists");
      return;
    }

    setSubmitting(true);

    try {
      // For now, we'll just add to local state since categories are derived from services
      // In a real implementation, you might want to create a categories API endpoint
      const newCategory = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name.trim(),
        description: formData.description.trim() || "Custom category",
        icon: formData.icon,
        serviceCount: 0,
        services: []
      };

      setCategories([...categories, newCategory]);
      setShowAddModal(false);
      setFormData({ name: "", description: "", icon: "Tag" });
      
      console.log("✅ Category added successfully");
    } catch (err) {
      console.error("❌ Error adding category:", err);
      alert(`Failed to add category: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    setSubmitting(true);

    try {
      // Update the category in local state
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id 
          ? {
              ...cat,
              name: formData.name.trim(),
              description: formData.description.trim() || cat.description,
              icon: formData.icon
            }
          : cat
      );

      setCategories(updatedCategories);
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", icon: "Tag" });
      
      console.log("✅ Category updated successfully");
    } catch (err) {
      console.error("❌ Error updating category:", err);
      alert(`Failed to update category: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    
    if (category && category.serviceCount > 0) {
      if (!window.confirm(`This category has ${category.serviceCount} services. Are you sure you want to delete it? Services will be moved to "General" category.`)) {
        return;
      }
    } else if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      // Remove category from local state
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      
      console.log("✅ Category deleted successfully");
    } catch (err) {
      console.error("❌ Error deleting category:", err);
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", icon: "Tag" });
  };

  // Calculate statistics
  const getStatistics = () => {
    if (categories.length === 0) return { totalCategories: 0, totalServices: 0, avgServicesPerCategory: 0, mostPopularCategory: null };
    
    const totalServices = categories.reduce((sum, cat) => sum + cat.serviceCount, 0);
    const avgServicesPerCategory = Math.round(totalServices / categories.length);
    const mostPopularCategory = categories.reduce((prev, current) => 
      (prev.serviceCount > current.serviceCount) ? prev : current
    );
    
    return { 
      totalCategories: categories.length, 
      totalServices, 
      avgServicesPerCategory, 
      mostPopularCategory: mostPopularCategory.name 
    };
  };

  const stats = getStatistics();

  // Show error state
  if (error) {
    return (
      <div className="categories-page">
        <div className="error-container">
          <div className="error-icon">
            <BarChart3 size={48} />
          </div>
          <h3 className="error-title">Error Loading Categories</h3>
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
      <div className="categories-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <span className="loading-text">Loading your categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page fade-in">
      {/* Page Header */}
      <div className="categories-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title gradient-text">Categories Management</h1>
            <p className="page-subtitle">Organize your salon services by categories</p>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchCategories}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="categories-stats">
        <div className="stats-card">
          <div className="stats-icon blue">
            <Tag size={24} />
          </div>
          <div className="stats-content">
            <h3>Total Categories</h3>
            <div className="stats-value">{stats.totalCategories}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon green">
            <Scissors size={24} />
          </div>
          <div className="stats-content">
            <h3>Total Services</h3>
            <div className="stats-value">{stats.totalServices}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon purple">
            <BarChart3 size={24} />
          </div>
          <div className="stats-content">
            <h3>Avg per Category</h3>
            <div className="stats-value">{stats.avgServicesPerCategory}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon indigo">
            <TrendingUp size={24} />
          </div>
          <div className="stats-content">
            <h3>Most Popular</h3>
            <div className="stats-value-small">{stats.mostPopularCategory || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Categories Content */}
      {categories.length === 0 ? (
        <div className="categories-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Tag size={48} />
            </div>
            <h3 className="empty-state-title">No Categories Found</h3>
            <p className="empty-state-description">
              Start by adding services to your salon or create custom categories to organize your offerings better.
            </p>
            <div className="empty-state-actions">
              <button
                onClick={() => navigate("/dashboard/add-service")}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add Service
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-secondary"
              >
                <Tag size={16} />
                Create Category
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="categories-content">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Your Categories ({categories.length})</h3>
              <div className="header-badge">
                <TrendingUp size={16} />
                <span>Active</span>
              </div>
            </div>
            
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-header">
                    <div className="category-icon">
                      {category.icon === 'Scissors' && <Scissors size={24} />}
                      {category.icon === 'Users' && <Users size={24} />}
                      {category.icon === 'Tag' && <Tag size={24} />}
                    </div>
                    <div className="category-actions">
                      <button
                        onClick={() => openEditModal(category)}
                        className="action-btn edit"
                        title="Edit Category"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="action-btn delete"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="category-content">
                    <h4 className="category-name">{category.name}</h4>
                    <p className="category-description">{category.description}</p>
                    
                    <div className="category-stats">
                      <div className="category-stat">
                        <span className="stat-value">{category.serviceCount}</span>
                        <span className="stat-label">Services</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="category-footer">
                    <button
                      onClick={() => navigate(`/dashboard/services?category=${category.name}`)}
                      className="view-services-btn"
                    >
                      View Services
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button onClick={closeModal} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="modal-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hair Care, Skin Care"
                  required
                  disabled={submitting}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category..."
                  disabled={submitting}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  disabled={submitting}
                  className="form-select"
                >
                  <option value="Tag">Tag</option>
                  <option value="Scissors">Scissors</option>
                  <option value="Users">Users</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Add Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button onClick={closeModal} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditCategory} className="modal-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hair Care, Skin Care"
                  required
                  disabled={submitting}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category..."
                  disabled={submitting}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  disabled={submitting}
                  className="form-select"
                >
                  <option value="Tag">Tag</option>
                  <option value="Scissors">Scissors</option>
                  <option value="Users">Users</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Update Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}