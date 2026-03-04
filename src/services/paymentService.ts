import api from "./api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SupportedPaymentMethod =
  | "ecocash"
  | "onemoney"
  | "telecash"
  | "innbucks"
  | "zimswitch"
  | "zipit"
  | "usd_bank"
  | "cash";

export interface PaymentMethodInfo {
  id: SupportedPaymentMethod;
  label: string;
  description: string;
  icon: string; // emoji
  requiresPhone: boolean;
  available: boolean; // can be toggled based on merchant account settings
}

/** All payment methods supported by the platform.
 *  The `available` flag mirrors what's enabled in your Paynow merchant account.
 *  When you enable more methods on Paynow, flip the flag here — no other changes needed. */
export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: "ecocash",
    label: "EcoCash",
    description: "Pay with your EcoCash mobile wallet",
    icon: "📱",
    requiresPhone: true,
    available: true,
  },
  {
    id: "innbucks",
    label: "InnBucks",
    description: "Pay with InnBucks",
    icon: "💳",
    requiresPhone: true,
    available: true,
  },
  {
    id: "zimswitch",
    label: "ZimSwitch / ZIPIT",
    description: "Pay with any ZimSwitch debit card or ZIPIT",
    icon: "🏦",
    requiresPhone: false,
    available: true,
  },
  {
    id: "usd_bank",
    label: "Internet/Mobile Banking",
    description: "Transfer from your bank's mobile or internet banking",
    icon: "🌐",
    requiresPhone: false,
    available: true,
  },
  {
    id: "onemoney",
    label: "OneMoney",
    description: "Pay with your OneMoney mobile wallet",
    icon: "📲",
    requiresPhone: true,
    available: false, // Enable when OneMoney is active on your Paynow account
  },
  {
    id: "telecash",
    label: "Telecash",
    description: "Pay with your Telecash mobile wallet",
    icon: "📲",
    requiresPhone: true,
    available: false, // Enable when Telecash is active on your Paynow account
  },
  {
    id: "cash",
    label: "Cash Deposit",
    description: "Hand cash to an authorized Agrivus representative",
    icon: "💵",
    requiresPhone: false,
    available: true,
  },
];

export interface PaymentInitiationRequest {
  amount: number;
  paymentMethod: SupportedPaymentMethod;
}

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    reference: string;
    amount: number;
    paymentMethod: string;
    status: string;
    paymentUrl?: string;
    pollUrl: string;
    instructions?: string;
    isMockPayment: boolean;
  };
}

export interface PaymentStatus {
  paymentId: string;
  reference: string;
  status:
    | "pending"
    | "processing"
    | "awaiting_delivery"
    | "completed"
    | "failed"
    | "cancelled";
  paid: boolean;
  amount: number;
  paidAmount?: number;
  completedAt?: string;
  instructions?: string;
  paymentUrl?: string;
  paymentMethod?: SupportedPaymentMethod;
}

export interface PaymentHistoryItem {
  id: string;
  type: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  reference: string;
  instructions?: string;
  createdAt: string;
  completedAt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

class PaymentService {
  /** Initiate a wallet deposit */
  async initiateDeposit(
    data: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResponse> {
    const response = await api.post("/payments/deposit", data);
    return response.data;
  }

  /** Check status of a payment by its DB UUID */
  async checkStatus(
    paymentId: string,
  ): Promise<{ success: boolean; data: PaymentStatus }> {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  }

  /** Get paginated payment history */
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<{
    success: boolean;
    data: {
      payments: PaymentHistoryItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const response = await api.get("/payments/history", { params });
    return response.data;
  }

  /**
   * Poll payment status until completion or failure.
   * Resolves on "completed", rejects on "failed"/"cancelled" or timeout.
   *
   * @param paymentId     DB UUID of the payment transaction
   * @param onStatusChange  Optional callback called on every poll
   * @param maxAttempts   Default 60 × 5s = 5 minutes
   */
  async pollPaymentStatus(
    paymentId: string,
    onStatusChange?: (status: PaymentStatus) => void,
    maxAttempts: number = 60,
  ): Promise<PaymentStatus> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const response = await this.checkStatus(paymentId);
          const status = response.data;

          onStatusChange?.(status);

          if (status.status === "completed") {
            clearInterval(interval);
            resolve(status);
            return;
          }

          if (status.status === "failed" || status.status === "cancelled") {
            clearInterval(interval);
            reject(new Error(`Payment ${status.status}`));
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(
              new Error(
                "Payment polling timeout — please check your payment history",
              ),
            );
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 5000);
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
