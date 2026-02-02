import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types";
import api, { clearCache } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error: any) {
      // Handle different types of errors with user-friendly messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 429) {
          // Rate limiting error
          const retryAfter = data.retryAfter || 900; // Default to 15 minutes
          const minutes = Math.ceil(retryAfter / 60);
          throw new Error(
            `Too many login attempts. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`,
          );
        } else if (status === 401 || status === 400) {
          // Invalid credentials
          throw new Error(
            "Invalid email or password. Please check your credentials and try again.",
          );
        } else if (status >= 500) {
          // Server error
          throw new Error(
            "Our servers are having trouble right now. Please try again in a few moments.",
          );
        } else {
          // Other errors with backend message
          throw new Error(data.message || "Login failed. Please try again.");
        }
      } else if (error.request) {
        // Network error - no response received
        throw new Error(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else {
        // Other errors
        throw new Error("Something went wrong. Please try again.");
      }
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error: any) {
      // Handle different types of errors with user-friendly messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 429) {
          // Rate limiting error
          const retryAfter = data.retryAfter || 900; // Default to 15 minutes
          const minutes = Math.ceil(retryAfter / 60);
          throw new Error(
            `Too many registration attempts. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`,
          );
        } else if (status === 409) {
          // Conflict - email already exists
          throw new Error(
            "This email is already registered. Please login or use a different email.",
          );
        } else if (status === 400) {
          // Validation error
          throw new Error(
            data.message || "Please check your information and try again.",
          );
        } else if (status >= 500) {
          // Server error
          throw new Error(
            "Our servers are having trouble right now. Please try again in a few moments.",
          );
        } else {
          // Other errors with backend message
          throw new Error(
            data.message || "Registration failed. Please try again.",
          );
        }
      } else if (error.request) {
        // Network error - no response received
        throw new Error(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else {
        // Other errors
        throw new Error("Something went wrong. Please try again.");
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCache(); // Clear cached requests on logout
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: { user: User };
      }>("/auth/refresh");

      if (response.data.success) {
        const { user: userData } = response.data.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error("Failed to refresh user data:", error);
      // Don't throw - silently fail to avoid breaking the app
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
