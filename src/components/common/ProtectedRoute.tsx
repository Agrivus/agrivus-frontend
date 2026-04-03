import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "./index";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Role-specific home pages — where to send user when they click "Go back"
const ROLE_HOME: Record<string, string> = {
  admin:             "/admin",
  support_moderator: "/moderator",
  accounts_officer:  "/accounts",
  farmer:            "/dashboard",
  buyer:             "/dashboard",
  transporter:       "/dashboard",
  agro_supplier:     "/dashboard",
  vendor:            "/dashboard",
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const homeRoute = ROLE_HOME[user.role] ?? "/dashboard";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-2">
            You don't have permission to view this page.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Signed in as{" "}
            <span className="font-medium text-gray-600">{user.email}</span>{" "}
            ({user.role.replace(/_/g, " ")})
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ← Go Back
            </button>
            <button
              onClick={() => navigate(homeRoute)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;