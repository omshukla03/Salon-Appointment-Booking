// src/component/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const owner = localStorage.getItem("owner"); // 👈 check login
  return owner ? children : <Navigate to="/partner/login" replace />;
}
