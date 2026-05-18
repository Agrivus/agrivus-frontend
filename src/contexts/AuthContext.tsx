import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
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
  loginWithGoogle: (data: {
    token: string;
    refreshToken?: string;
    user: Pick<User, "id" | "email" | "fullName" | "role"> & Partial<User>;
  }) => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ApiError = {
  response?: {
    status?: number;
    data?: unknown;
  };
  request?: unknown;
};

const getErrorResponse = (error: unknown) => {
  if (!error || typeof error !== "object") return null;
  return (error as ApiError).response ?? null;
};

const hasRequest = (error: unknown) =>
  !!error && typeof error === "object" && "request" in error;

const getServerMessage = (data: unknown) => {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.error === "string") return record.error;
  const details = record.details;
  if (details && typeof details === "object") {
    const detailsMessage = (details as Record<string, unknown>).message;
    if (typeof detailsMessage === "string") return detailsMessage;
  }
  return undefined;
};

const getRetryAfterSeconds = (data: unknown) => {
  if (!data || typeof data !== "object") return null;
  const retryAfter = (data as Record<string, unknown>).retryAfter;
  if (typeof retryAfter === "number") return retryAfter;
  if (typeof retryAfter === "string" && retryAfter.trim()) {
    const parsed = Number(retryAfter);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [loading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem("token", userToken);
        if (response.data.data.claimPending && response.data.data.claimMatch) {
          localStorage.setItem(
            "claimMatch",
            JSON.stringify(response.data.data.claimMatch),
          );
        }
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error: unknown) {
      // Handle different types of errors with user-friendly messages
      const response = getErrorResponse(error);
      if (response) {
        const status = response.status ?? 0;
        const data = response.data;

        if (status === 429) {
          // Rate limiting error
          const retryAfter = getRetryAfterSeconds(data) ?? 900; // Default to 15 minutes
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
          throw new Error(
            getServerMessage(data) || "Login failed. Please try again.",
          );
        }
      } else if (hasRequest(error)) {
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
    } catch (error: unknown) {
      // Handle different types of errors with user-friendly messages
      const response = getErrorResponse(error);
      if (response) {
        const status = response.status ?? 0;
        const responseData = response.data;
        const serverMessage = getServerMessage(responseData);
        const fallbackStatusMessage =
          status === 400
            ? "Registration request was rejected. Please verify your details and try again."
            : `Registration failed with status ${status}. Please try again.`;

        if (status === 429) {
          // Rate limiting error
          const retryAfter = getRetryAfterSeconds(responseData) ?? 900; // Default to 15 minutes
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
            serverMessage || fallbackStatusMessage,
          );
        } else if (status >= 500) {
          // Server error
          throw new Error(
            "Our servers are having trouble right now. Please try again in a few moments.",
          );
        } else {
          // Other errors with backend message
          throw new Error(
            serverMessage || fallbackStatusMessage,
          );
        }
      } else if (hasRequest(error)) {
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

  const loginWithGoogle: AuthContextType["loginWithGoogle"] = (data) => {
    const nowIso = new Date().toISOString();

    const normalizedUser: User = {
      ...data.user,
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      role: data.user.role,
      phone: data.user.phone ?? "",
      isVerified: data.user.isVerified ?? true,
      platformScore: data.user.platformScore ?? 0,
      totalTransactions: data.user.totalTransactions ?? 0,
      totalVolume: data.user.totalVolume ?? "0",
      createdAt: data.user.createdAt ?? nowIso,
    };

    setUser(normalizedUser);
    setToken(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    clearCache(); // Clear cached requests on logout
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;

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
    } catch (error: unknown) {
      console.error("Failed to refresh user data:", error);
      // Don't throw - silently fail to avoid breaking the app
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
