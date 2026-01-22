import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // Increased timeout for slow connections
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST CACHING SYSTEM
// ============================================

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (300 seconds)

// Endpoints that should NOT be cached (always fresh)
const NO_CACHE_PATTERNS = [
  /\/auth\//, // Auth endpoints
  /\/checkout/, // Checkout/payment
  /\/orders\//, // Order creation/updates
  /\/cart/, // Cart operations
  /\/chat/, // Chat messages
  /\/notifications/, // Notifications
];

// Helper to check if endpoint should be cached
const shouldCache = (url: string): boolean => {
  return !NO_CACHE_PATTERNS.some((pattern) => pattern.test(url));
};

// Helper to generate cache key
const getCacheKey = (config: AxiosRequestConfig): string => {
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${config.url}?${params}`;
};

// Helper to check if cache is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests only
    if (config.method === "get" && shouldCache(config.url || "")) {
      const cacheKey = getCacheKey(config);
      const cached = cache.get(cacheKey);

      if (cached && isCacheValid(cached.timestamp)) {
        // Serve from cache
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: "OK (from cache)",
            headers: config.headers,
            config,
          });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (
      response.config.method === "get" &&
      response.status === 200 &&
      shouldCache(response.config.url || "")
    ) {
      const cacheKey = getCacheKey(response.config);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Clear all cached data (e.g., on logout)
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Clear cache for specific endpoint
 */
export const clearCacheForEndpoint = (endpoint: string): void => {
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(endpoint)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => cache.delete(key));
};

/**
 * Get cache statistics (useful for debugging)
 */
export const getCacheStats = (): {
  size: number;
  entries: string[];
} => {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
};

export default api;
