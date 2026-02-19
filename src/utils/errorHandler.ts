/**
 * Converts API errors into user-friendly messages
 * Removes error codes and technical jargon from user-facing errors
 */

export const getErrorMessage = (err: any, fallbackMessage?: string): string => {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;
  const defaultFallback =
    fallbackMessage || "Something went wrong. Please try again.";

  // Authentication errors
  if (status === 401) {
    return "Please sign in to continue.";
  }

  // Permission errors
  if (status === 403) {
    if (serverMessage?.toLowerCase().includes("own listing")) {
      return "You cannot buy your own listing.";
    }
    if (serverMessage?.toLowerCase().includes("permission")) {
      return "You don't have permission to perform this action.";
    }
    return "Access denied. You cannot perform this action.";
  }

  // Not found errors
  if (status === 404) {
    return "The requested item was not found.";
  }

  // Validation errors (400)
  if (status === 400) {
    if (serverMessage) {
      // If server provides a clear message, use it (already user-friendly)
      return serverMessage;
    }
    return "Please check your input and try again.";
  }

  // Conflict errors
  if (status === 409) {
    if (serverMessage) {
      return serverMessage;
    }
    return "This action conflicts with existing data.";
  }

  // Rate limiting
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // Server errors (500+)
  if (status >= 500) {
    return "Our servers are having trouble. Please try again later.";
  }

  // Network errors
  if (err?.message === "Network Error" || !navigator.onLine) {
    return "No internet connection. Please check your network.";
  }

  // Timeout errors
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  // If server provides a user-friendly message, use it
  if (serverMessage && typeof serverMessage === "string") {
    return serverMessage;
  }

  // If app code already produced a friendly error message, preserve it
  if (err?.message && typeof err.message === "string") {
    return err.message;
  }

  // Default fallback
  return defaultFallback;
};

/**
 * Context-specific error messages for common operations
 */

export const getOrderErrorMessage = (err: any): string => {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;

  if (status === 403) {
    if (serverMessage?.toLowerCase().includes("own listing")) {
      return "You cannot buy your own listing.";
    }
    return "You don't have permission to place this order.";
  }

  if (status === 400) {
    if (serverMessage?.toLowerCase().includes("quantity")) {
      return serverMessage;
    }
    if (serverMessage?.toLowerCase().includes("stock")) {
      return "This item is out of stock or doesn't have enough quantity available.";
    }
  }

  return getErrorMessage(
    err,
    "We couldn't place your order. Please try again.",
  );
};

export const getListingErrorMessage = (err: any): string => {
  return getErrorMessage(
    err,
    "Failed to load listing details. Please refresh the page.",
  );
};

export const getPaymentErrorMessage = (err: any): string => {
  const status = err?.response?.status;

  if (status === 402) {
    return "Insufficient funds. Please add money to your wallet.";
  }

  return getErrorMessage(
    err,
    "Payment failed. Please try again or contact support.",
  );
};

export const getAuctionErrorMessage = (err: any): string => {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;

  if (status === 400 && serverMessage?.toLowerCase().includes("bid")) {
    return serverMessage;
  }

  if (status === 409) {
    return "This auction has already been completed or is no longer accepting bids.";
  }

  return getErrorMessage(
    err,
    "Failed to process auction action. Please try again.",
  );
};

export const getChatErrorMessage = (err: any): string => {
  return getErrorMessage(err, "Failed to load messages. Please refresh.");
};

export const getWalletErrorMessage = (err: any): string => {
  const status = err?.response?.status;

  if (status === 400) {
    return "Invalid amount. Please enter a valid number.";
  }

  if (status === 402) {
    return "Insufficient funds for this transaction.";
  }

  return getErrorMessage(err, "Wallet operation failed. Please try again.");
};
