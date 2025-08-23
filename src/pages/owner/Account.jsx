import { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Building, 
  Save, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit3,
  Camera,
  Globe,
  Shield,
  Settings,
  Bell
} from "lucide-react";
import { getCurrentSalonId } from "../../utils/authUtils";

export default function Account() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    openTime: "",
    closeTime: "",
    description: "",
    website: "",
    instagramHandle: "",
    facebookPage: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchSalonData();
  }, []);

  const fetchSalonData = async () => {
    try {
      setLoading(true);
      const currentSalonId = getCurrentSalonId();
      
      if (!currentSalonId) {
        setMessage({ type: 'error', text: 'No salon ID found. Please login again.' });
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5002/api/salons/${currentSalonId}`);
      setForm({
        name: response.data.name || "",
        email: response.data.email || "",
        phoneNumber: response.data.phoneNumber || "",
        address: response.data.address || "",
        city: response.data.city || "",
        state: response.data.state || "",
        pincode: response.data.pincode || "",
        openTime: response.data.openTime || "",
        closeTime: response.data.closeTime || "",
        description: response.data.description || "",
        website: response.data.website || "",
        instagramHandle: response.data.instagramHandle || "",
        facebookPage: response.data.facebookPage || ""
      });
    } catch (err) {
      console.error("Error fetching salon account", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to load account data' 
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) newErrors.name = "Salon name is required";
    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email format is invalid";
    }
    if (!form.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    if (!form.address?.trim()) newErrors.address = "Address is required";
    if (!form.city?.trim()) newErrors.city = "City is required";

    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }

    if (form.openTime && form.closeTime && form.openTime >= form.closeTime) {
      newErrors.closeTime = "Close time must be after open time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors before saving' });
      return;
    }

    try {
      setSaving(true);
      const currentSalonId = getCurrentSalonId();
      
      console.log("Sending Update Payload:", form);

      const response = await axios.put(`http://localhost:5002/api/salons/${currentSalonId}`, form);
      
      setForm(response.data);
      setMessage({ type: 'success', text: 'Account updated successfully!' });
      setErrors({});
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error updating account:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update account' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? This will restore the last saved values.')) {
      fetchSalonData();
      setErrors({});
      setMessage(null);
    }
  };

  if (loading) {
    return (
      <div className="owner-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading account settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="content-card mb-8">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="stats-icon purple">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="card-title">Account Settings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your salon profile and business information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type} mb-6 fade-in`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <div>
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
        >
          <User size={16} /> Basic Information
        </button>
        <button
          onClick={() => setActiveTab("business")}
          className={`tab-button ${activeTab === "business" ? "active" : ""}`}
        >
          <Building size={16} /> Business Details
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`tab-button ${activeTab === "social" ? "active" : ""}`}
        >
          <Globe size={16} /> Online Presence
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === "profile" && (
          <div className="content-card fade-in">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <User size={20} />
                Basic Information
              </h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building size={16} className="inline mr-2" />
                      Salon Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your salon name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                        errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your complete address"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="City name"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="State name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="6-digit pincode"
                      maxLength="6"
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div className="content-card fade-in">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Building size={20} />
                Business Details
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Edit3 size={16} className="inline mr-2" />
                    Business Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe your salon, services, and what makes you special..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Help customers understand what your salon offers and why they should choose you.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} className="inline mr-2" />
                      Operating Hours
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Open Time</label>
                        <input
                          type="time"
                          name="openTime"
                          value={form.openTime}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Close Time</label>
                        <input
                          type="time"
                          name="closeTime"
                          value={form.closeTime}
                          onChange={handleChange}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.closeTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.closeTime && <p className="text-red-500 text-sm mt-1">{errors.closeTime}</p>}
                      </div>
                    </div>
                    {form.openTime && form.closeTime && (
                      <p className="text-sm text-gray-600 mt-2">
                        <Clock size={14} className="inline mr-1" />
                        Operating hours: {form.openTime} - {form.closeTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe size={16} className="inline mr-2" />
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.website ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="https://yoursalon.com"
                    />
                    {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      Include your website URL if you have one
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    Business Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>Profile Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.name && form.email && form.phoneNumber && form.address ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span>Profile Complete</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-500" />
                          <span>Profile Incomplete</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>Ready for Bookings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="content-card fade-in">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Globe size={20} />
                Online Presence
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">@</span>
                      <input
                        type="text"
                        name="instagramHandle"
                        value={form.instagramHandle}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="yoursalon"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Your Instagram username without the @ symbol
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Page
                    </label>
                    <input
                      type="text"
                      name="facebookPage"
                      value={form.facebookPage}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Your Salon Page Name"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your Facebook page name or URL
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Bell size={18} />
                    Social Media Tips
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Link your social media accounts to help customers find and follow you online</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Share your work on Instagram to showcase your salon's expertise and attract new clients</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Use Facebook to share business updates, special offers, and customer testimonials</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Camera size={18} />
                    Profile Preview
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    This is how your salon will appear to customers:
                  </p>
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-bold text-lg text-gray-800">{form.name || "Your Salon Name"}</h5>
                    <div className="space-y-1 text-sm text-gray-600 mt-2">
                      <p className="flex items-center gap-2">
                        <MapPin size={14} />
                        {form.address || "Your salon address"}
                        {form.city && `, ${form.city}`}
                        {form.pincode && ` - ${form.pincode}`}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={14} />
                        {form.phoneNumber || "Phone number"}
                      </p>
                      {(form.openTime && form.closeTime) && (
                        <p className="flex items-center gap-2">
                          <Clock size={14} />
                          {form.openTime} - {form.closeTime}
                        </p>
                      )}
                      {form.description && (
                        <p className="mt-2 text-gray-700">{form.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {form.website && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Website</span>
                      )}
                      {form.instagramHandle && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">Instagram</span>
                      )}
                      {form.facebookPage && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Facebook</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Save Button */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Ready to save your changes?</p>
              <p className="text-sm text-gray-600">Make sure all required fields are filled correctly.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="btn btn-secondary"
              >
                <RefreshCw size={16} />
                Reset Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}