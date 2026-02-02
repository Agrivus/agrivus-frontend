import api from "./api";
import type {
  ApiResponse,
  Order,
  OrderFilters,
  TransporterMatch,
} from "../types";

export const ordersService = {
  // Create order (buyers only)
  createOrder: async (data: {
    listingId: string;
    quantity: string;
    deliveryLocation: string;
    notes?: string;
    usesTransport?: boolean;
  }) => {
    const response = await api.post<ApiResponse<Order>>("/orders", data);
    return response.data;
  },

  // Get all orders (role-filtered)
  getOrders: async (filters?: OrderFilters) => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get<
      ApiResponse<{
        orders: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(`/orders?${params.toString()}`);

    return response.data;
  },

  // Get single order by ID
  getOrderById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/orders/${id}`);
    return response.data;
  },

  // Match transporter (farmers only)
  matchTransporter: async (orderId: string) => {
    const response = await api.get<
      ApiResponse<{
        orderId: string;
        pickupLocation: string;
        deliveryLocation: string;
        estimatedDistance?: number;
        estimatedWeightKg?: number;
        minimumFee?: number;
        feeNote?: string;
        matches: TransporterMatch[];
      }>
    >(`/orders/${orderId}/match-transporter`);
    return response.data;
  },

  // Assign transporters - Cascading system with 3 priority tiers
  assignTransporter: async (
    orderId: string,
    data: {
      primaryTransporterId: string;
      secondaryTransporterId?: string;
      tertiaryTransporterId?: string;
      transportCost: string;
      pickupLocation?: string;
    },
  ) => {
    const response = await api.post<ApiResponse<any>>(
      `/orders/${orderId}/assign-transporter`,
      data,
    );
    return response.data;
  },

  // Get pending transport offers (transporters only)
  getTransportOffers: async (status: string = "pending") => {
    const response = await api.get<
      ApiResponse<{
        offers: any[];
      }>
    >(`/orders/offers?status=${status}`);
    return response.data;
  },

  // Accept transport offer
  acceptTransportOffer: async (offerId: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/orders/offers/${offerId}/accept`,
    );
    return response.data;
  },

  // Counter transport offer (transporter)
  counterTransportOffer: async (offerId: string, counterFee: number) => {
    const response = await api.post<ApiResponse<any>>(
      `/orders/offers/${offerId}/counter`,
      { counterFee },
    );
    return response.data;
  },

  // Decline transport offer
  declineTransportOffer: async (offerId: string, reason?: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/orders/offers/${offerId}/decline`,
      { reason },
    );
    return response.data;
  },

  // Accept transport counter offer (farmer)
  acceptTransportCounter: async (offerId: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/orders/offers/${offerId}/accept-counter`,
    );
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status },
    );
    return response.data;
  },

  // Confirm delivery (buyers only)
  confirmDelivery: async (orderId: string) => {
    const response = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/confirm-delivery`,
    );
    return response.data;
  },
};
