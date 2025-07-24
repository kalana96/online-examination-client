import React from "react";
import { Navigate } from "react-router-dom";
import UserService from "../service/UserService";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = UserService.isAuthenticated();
  const userRole = UserService.getRole();

  // Check if user is authenticated
  if (!isAuthenticated) {
    toast.error("Please login to access this page");
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    toast.error("You do not have permission to access this page");

    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "STUDENT":
        return <Navigate to="/student" replace />;
      case "TEACHER":
        return <Navigate to="/teacher" replace />;
      default:
        toast.error("Invalid role. Please login again.");
        UserService.logout();
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
