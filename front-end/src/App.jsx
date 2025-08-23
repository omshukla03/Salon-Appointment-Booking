// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerRegister from "./pages/PartnerRegister";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess";

// Customer Components
import CustomerDashboard from "./pages/customer/Dashboard";

// Owner Layout + Pages
import Layout from "./components/owner/Layout";
import Dashboard from "./pages/owner/Dashboard";
import Bookings from "./pages/owner/Bookings";
import Services from "./pages/owner/Services";
import AddService from "./pages/owner/AddService";
import Payments from "./pages/owner/Payments";
import Transactions from "./pages/owner/Transactions";
import Categories from "./pages/owner/Categories";
import Notifications from "./pages/owner/Notifications";
import Account from "./pages/owner/Account";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner/register" element={<PartnerRegister />} />
        <Route path="/payment-success/:id" element={<PaymentSuccess />} />

        {/* ✅ Customer Routes */}
        <Route 
          path="/customer/dashboard" 
          element={<CustomerDashboard />} 
        />
        
       <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />

        {/* ✅ Owner Routes (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="services" element={<Services />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="categories" element={<Categories />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </Router>
  );
}