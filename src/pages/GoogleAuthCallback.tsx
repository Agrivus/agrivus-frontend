import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getRoleLandingRoute } from "../utils/roleLandingRoute";

/**
 * This page handles the redirect from the backend after Google OAuth.
 * It reads the token from the URL, stores it, and redirects to the dashboard.
 *
 * Route: /auth/google/callback
 */
const GoogleAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError]   = useState("");
  const { loginWithGoogle } = useAuth();
  const navigate            = useNavigate();

  useEffect(() => {
    const token        = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const userId       = searchParams.get("userId");
    const email        = searchParams.get("email");
    const fullName     = searchParams.get("fullName");
    const role         = searchParams.get("role");
    const authError    = searchParams.get("error");

    if (authError || !token || !refreshToken || !userId || !email || !role) {
      setError("Google sign-in failed. Please try again.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // Store tokens and user in AuthContext (same as email/password login)
    loginWithGoogle({
      token,
      refreshToken,
      user: {
        id:       userId,
        email,
        fullName: fullName ?? "",
        role:     role as any,
      },
    });

    navigate(getRoleLandingRoute(role));
  }, [loginWithGoogle, navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Sign-in Failed
          </h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;