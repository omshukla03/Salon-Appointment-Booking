// Debug version - Simplified Navbar for testing
import { getCurrentSalon, getCurrentOwner, clearAuth } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [owner, setOwner] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const salonData = getCurrentSalon();
    const ownerData = getCurrentOwner();
    setSalon(salonData);
    setOwner(ownerData);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simple test handlers with alerts
  const testProfile = () => {
    alert("Profile button clicked!");
    console.log("Profile clicked");
    setShowProfileDropdown(false);
    // navigate("/dashboard/profile");
  };

  const testSettings = () => {
    alert("Settings button clicked!");
    console.log("Settings clicked");
    setShowProfileDropdown(false);
    // navigate("/dashboard/account");
  };

  const testLogout = () => {
    alert("Logout button clicked!");
    console.log("Logout clicked");
    setShowProfileDropdown(false);
    // if (window.confirm("Are you sure you want to logout?")) {
    //   clearAuth();
    //   navigate("/partner/login");
    // }
  };

  return (
    <div className="dashboard-navbar">
      <div className="navbar-title">
        <h1>{salon?.name || "Salon Dashboard"}</h1>
        <div className="navbar-subtitle">
          {salon?.city && <span>{salon.city}</span>}
        </div>
      </div>

      <div className="navbar-actions">
        {/* Notifications */}
        <button
          onClick={() => navigate("/dashboard/notifications")}
          className="navbar-icon-btn"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        {/* Profile Dropdown */}
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="profile-trigger"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-avatar">
              {(owner?.name || owner?.email || "O").charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <p className="profile-name">
                {owner?.name || owner?.email || "Owner"}
              </p>
              {salon?.city && (
                <p className="profile-location">{salon.city}</p>
              )}
            </div>
            <ChevronDown 
              size={16} 
              className={`chevron ${showProfileDropdown ? 'rotate' : ''}`} 
            />
          </button>

          {showProfileDropdown && (
            <div className="profile-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '200px',
              zIndex: 9999
            }}>
              <div className="dropdown-header" style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
                <div className="profile-avatar-large">
                  {(owner?.name || owner?.email || "O").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="dropdown-name">
                    {owner?.name || owner?.email || "Owner"}
                  </p>
                  <p className="dropdown-email">
                    {owner?.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="dropdown-menu" style={{ padding: '8px 0' }}>
                {/* Profile Button */}
                <div
                  onClick={testProfile}
                  onMouseDown={testProfile}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <User size={16} />
                  <span>Profile (Click Test)</span>
                </div>

                {/* Settings Button */}
                <div
                  onClick={testSettings}
                  onMouseDown={testSettings}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Settings size={16} />
                  <span>Settings (Click Test)</span>
                </div>

                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />

                {/* Logout Button */}
                <div
                  onClick={testLogout}
                  onMouseDown={testLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>Logout (Click Test)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}