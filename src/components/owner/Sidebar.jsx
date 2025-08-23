import { Link, useLocation } from "react-router-dom";
import { BarChart3, Calendar, Scissors, Plus, CreditCard, DollarSign, FolderOpen, Bell, Settings } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const navigation = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/dashboard/services', icon: Scissors, label: 'Services' },
    { path: '/dashboard/add-service', icon: Plus, label: 'Add Service' },
    { path: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { path: '/dashboard/transactions', icon: DollarSign, label: 'Transactions' },
    { path: '/dashboard/categories', icon: FolderOpen, label: 'Categories' },
    { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { path: '/dashboard/account', icon: Settings, label: 'Account' }
  ];

  const isActiveLink = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Scissors size={20} />
        </div>
        <span className="sidebar-logo-text">Style Studio</span>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="sidebar-nav">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path} className="sidebar-nav-item">
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                >
                  <span className="sidebar-nav-icon">
                    <IconComponent size={18} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Style Studio Dashboard</p>
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}