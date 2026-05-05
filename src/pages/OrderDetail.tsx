import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { safeDisplayText } from "../utils/textUtils";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { BuyerTransporterSelectionModal } from "../components/orders/BuyerTransporterSelectionModal";
import { ordersService } from "../services/ordersService";
import chatService from "../services/chatService";
import api from "../services/api";

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showTransporterSelection, setShowTransporterSelection] =
    useState(false);

  // ── Handoff state ──────────────────────────────────────────────────────────
  const [showHandoffModal, setShowHandoffModal]         = useState(false);
  const [handoffPassword, setHandoffPassword]           = useState("");
  const [handoffError, setHandoffError]                 = useState("");
  const [handoffLoading, setHandoffLoading]             = useState(false);
  const [handoffSuccess, setHandoffSuccess]             = useState(false);

  // ── Delivery password setup state (buyer) ──────────────────────────────────
  const [showPasswordSetup, setShowPasswordSetup]       = useState(false);
  const [hasDeliveryPassword, setHasDeliveryPassword]   = useState<boolean | null>(null);
  const [newPassword, setNewPassword]                   = useState("");
  const [currentPassword, setCurrentPassword]           = useState("");
  const [passwordSetupError, setPasswordSetupError]     = useState("");
  const [passwordSetupLoading, setPasswordSetupLoading] = useState(false);
  const [passwordSetupSuccess, setPasswordSetupSuccess] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    // Check if buyer has a delivery password set
    if (user?.role === "buyer" || user?.role === "farmer" || user?.role === "agro_supplier") {
      checkDeliveryPasswordStatus();
    }
  }, [user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrderById(id!);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const checkDeliveryPasswordStatus = async () => {
    try {
      const res = await api.get("/auth/delivery-password/status");
      if (res.data.success) setHasDeliveryPassword(res.data.data.hasDeliveryPassword);
    } catch { /* non-critical */ }
  };

  // ── Standard buyer confirm ─────────────────────────────────────────────────

  const handleConfirmDelivery = async () => {
    if (
      !window.confirm(
        "Confirm that you have received the goods in good condition?",
      )
    ) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");
      setActionLoading(true);
      const response = await ordersService.confirmDelivery(id!);
      if (response.success) {
        setSuccessMessage("Delivery confirmed! Payment released to seller.");
        fetchOrderDetails();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to confirm delivery");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handoff confirm (seller-initiated, buyer enters password) ──────────────

  const handleHandoffConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoffPassword.trim()) {
      setHandoffError("Please enter the buyer's delivery password");
      return;
    }
    try {
      setHandoffError(""); setHandoffLoading(true);
      const res = await api.post(`/orders/${id}/handoff-confirm`, {
        deliveryPassword: handoffPassword,
      });
      if (res.data.success) {
        setHandoffSuccess(true);
        setSuccessMessage("✅ Handoff confirmed. Funds released to all parties.");
        fetchOrderDetails();
        setTimeout(() => setShowHandoffModal(false), 2000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Incorrect password or handoff failed";
      if (err.response?.data?.data?.fallbackRequired) {
        setHandoffError("The buyer hasn't set a delivery password yet. Ask them to confirm delivery from their account instead.");
      } else {
        setHandoffError(msg);
      }
    } finally {
      setHandoffLoading(false);
    }
  };

  // ── Delivery password setup ────────────────────────────────────────────────

  const handleSetDeliveryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordSetupError("Password must be at least 4 characters");
      return;
    }
    try {
      setPasswordSetupError(""); setPasswordSetupLoading(true);
      const payload: any = { password: newPassword };
      if (hasDeliveryPassword) payload.currentPassword = currentPassword;
      const res = await api.put("/auth/delivery-password", payload);
      if (res.data.success) {
        setPasswordSetupSuccess(res.data.message);
        setHasDeliveryPassword(true);
        setNewPassword(""); setCurrentPassword("");
        setTimeout(() => { setShowPasswordSetup(false); setPasswordSetupSuccess(""); }, 2000);
      }
    } catch (err: any) {
      setPasswordSetupError(err.response?.data?.message ?? "Failed to set password");
    } finally {
      setPasswordSetupLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    if (
      !window.confirm(
        "Approve this order? Buyer funds will then be held in escrow.",
      )
    ) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");
      setActionLoading(true);
      const response = await ordersService.updateOrderStatus(id!, "paid");
      if (response.success) {
        setSuccessMessage(
          "✅ Order approved. Buyer funds are now secured in escrow.",
        );
        fetchOrderDetails();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to approve order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOrder = async () => {
    if (
      !window.confirm(
        "Decline this order? No payment will be processed for the buyer.",
      )
    ) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");
      setActionLoading(true);
      const response = await ordersService.updateOrderStatus(id!, "cancelled");
      if (response.success) {
        setSuccessMessage("✅ Order declined. Buyer was notified.");
        fetchOrderDetails();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to decline order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageUser = async (userId: string) => {
    try {
      setActionError("");
      const response = await chatService.getOrCreateConversation(userId);
      if (response.success) {
        navigate("/chat", { state: { conversationId: response.data.id } });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      setActionError("Failed to start conversation. Please try again.");
    }
  };

  const handleMarkInTransit = async () => {
    const isPickup = !order?.order?.usesTransport;
    const message = isPickup
      ? "Confirm that the goods are ready for the buyer to collect?"
      : "Confirm that the goods have been dispatched/handed over for delivery?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");
      setActionLoading(true);
      const response = await ordersService.updateOrderStatus(id!, "in_transit");
      if (response.success) {
        const successMsg = isPickup
          ? "✅ Goods marked as ready for pickup!"
          : "✅ Order marked as in transit!";
        setSuccessMessage(successMsg);
        fetchOrderDetails();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptCounterOffer = async (offerId: string) => {
    if (!window.confirm("Accept the transporter's counter offer? This will assign them to the order.")) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");
      setActionLoading(true);
      const response = await ordersService.acceptTransportCounter(offerId);
      if (response.success) {
        setSuccessMessage("✅ Counter offer accepted! Transporter has been assigned.");
        fetchOrderDetails();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to accept counter offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    const isPickup = !order?.order?.usesTransport;
    const message = isPickup
      ? "Confirm that the buyer has collected the goods?"
      : "Confirm that the goods have been delivered to the buyer?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setActionError("");
      setSuccessMessage("");
      setActionLoading(true);
      const response = await ordersService.updateOrderStatus(id!, "delivered");
      if (response.success) {
        const successMsg = isPickup
          ? "✅ Collection confirmed! Waiting for buyer to confirm receipt."
          : "✅ Order marked as delivered! Waiting for buyer confirmation.";
        setSuccessMessage(successMsg);
        fetchOrderDetails();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_transit: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string, usesTransport: boolean) => {
    if (status === "pending") {
      return "AWAITING FARMER APPROVAL";
    }
    if (status === "in_transit") {
      return usesTransport ? "IN TRANSIT" : "READY FOR COLLECTION";
    }
    return status.replace("_", " ").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Order not found"}</p>
          <Button variant="primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const isBuyer = user?.id === order.order.buyerId;
  const isFarmer = user?.id === order.order.farmerId;
  const isTransporter =
    order.transport && user?.id === order.transport.transporterId;
  const canBuyerSelectTransporter =
    isBuyer &&
    order.order.status === "paid" &&
    order.order.usesTransport &&
    !order.transporter;

  // Handoff button visible to farmer or transporter when order is delivered
  const canInitiateHandoff = (isFarmer || isTransporter) && order.order.status === "delivered";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="mb-4"
          >
            ← Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-primary-green">
            Order Details
          </h1>
          <p className="text-gray-600 mt-1">
            Order ID: {order.order.id.substring(0, 8)}...
          </p>
        </div>

        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {actionError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Buyer delivery password prompt */}
        {isBuyer && hasDeliveryPassword === false && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
            <div className="text-2xl">🔑</div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Set your delivery password</p>
              <p className="text-sm text-amber-800 mt-1">
                Set a delivery password so the farmer or transporter can confirm receipt on your behalf when they hand over goods — no phone needed.
              </p>
            </div>
            <button
              onClick={() => setShowPasswordSetup(true)}
              className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Set Password
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Status
                </h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                    order.order.status,
                  )}`}
                >
                  {getStatusText(order.order.status, order.order.usesTransport)}
                </span>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">Order Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.order.status !== "pending" && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">Payment in Escrow</p>
                      <p className="text-sm text-gray-600">Funds secured</p>
                    </div>
                  </div>
                )}

                {order.transporter && (
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        order.order.status === "in_transit" ||
                        order.order.status === "delivered"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {order.order.status === "in_transit" ||
                      order.order.status === "delivered"
                        ? "✓"
                        : "○"}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">In Transit</p>
                      <p className="text-sm text-gray-600">
                        Being delivered by transporter
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      order.order.status === "delivered"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  >
                    {order.order.status === "delivered" ? "✓" : "○"}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">
                      {order.order.usesTransport ? "Delivered" : "Collected"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.order.deliveredAt
                        ? new Date(order.order.deliveredAt).toLocaleString()
                        : order.order.usesTransport
                          ? "Awaiting delivery"
                          : "Awaiting collection"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Product Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Product Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Product:</span>
                  <span className="ml-2 font-semibold">
                    {order.listing?.cropType || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <span className="ml-2 font-semibold">
                    {order.order.quantity} {order.listing?.unit || "units"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pickup Location:</span>
                  <span className="ml-2 font-semibold">
                    {order.listing?.location || "N/A"}
                  </span>
                </div>
                {order.listing?.description && (
                  <div>
                    <span className="text-gray-600 block mb-1">
                      Description:
                    </span>
                    <p className="text-sm">
                      {safeDisplayText(order.listing?.description)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {order.order.usesTransport
                  ? "Delivery Information"
                  : "Collection Information"}
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">
                    {order.order.usesTransport
                      ? "Delivery Location:"
                      : "Collection Location:"}
                  </span>
                  <span className="ml-2 font-semibold">
                    {order.order.usesTransport
                      ? order.order.deliveryLocation
                      : order.listing?.location || "Pickup from farm"}
                  </span>
                </div>
                {order.transporter ? (
                  isTransporter ? (
                    /* Transporter sees farmer details (pickup point) */
                    <>
                      <div>
                        <span className="text-gray-600">Pickup From:</span>
                        <span className="ml-2 font-semibold">
                          {order.farmer.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-semibold">
                          {order.farmer.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pickup Location:</span>
                        <span className="ml-2 font-semibold">
                          {order.listing?.location || "Farm location"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleMessageUser(order.order.farmerId)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mt-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Message Farmer
                      </button>
                    </>
                  ) : (
                    /* Buyer and Farmer see transporter details */
                    <>
                      <div>
                        <span className="text-gray-600">Transporter:</span>
                        <span className="ml-2 font-semibold">
                          {order.transporter.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-semibold">
                          {order.transporter.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="ml-2 font-semibold">
                          {order.transporter.vehicleType}
                        </span>
                      </div>
                      <button
                        onClick={() => handleMessageUser(order.transporter.id)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mt-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Message Transporter
                      </button>
                    </>
                  )
                ) : order.transportOffer?.status === "countered" && isBuyer ? (
                  <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-orange-800 mb-1">💰 Counter Offer Received</h4>
                        <p className="text-sm text-orange-700">
                          {order.offerTransporter?.fullName || "Transporter"} has proposed a different price
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Your Offer</p>
                        <p className="text-lg font-bold text-gray-700">
                          ${parseFloat(order.transportOffer.transportCost).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border-2 border-orange-400">
                        <p className="text-xs text-orange-600 uppercase font-semibold">Counter Offer</p>
                        <p className="text-lg font-bold text-orange-700">
                          ${parseFloat(order.transportOffer.counterFee).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleAcceptCounterOffer(order.transportOffer.id)}
                      isLoading={actionLoading}
                      disabled={actionLoading}
                    >
                      ✅ Accept Counter Offer
                    </Button>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Contact: {order.offerTransporter?.phone || "N/A"}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      {order.order.usesTransport
                        ? "🚚 Platform transport - Transporter will be assigned soon"
                        : "🚗 Self pickup - Buyer will arrange their own transport"}
                    </p>
                  </div>
                )}
                {order.order.notes && (
                  <div>
                    <span className="text-gray-600 block mb-1">Notes:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {safeDisplayText(order.order.notes)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info - For Transporters, show both Buyer and Farmer */}
            {isTransporter ? (
              <>
                {/* Buyer Contact Card */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Buyer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 block text-sm">Name</span>
                      <span className="font-semibold">
                        {order.buyer.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-sm">Phone</span>
                      <span className="font-semibold">
                        {order.buyer.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-sm">Rating</span>
                      <span className="font-semibold">
                        ⭐ {order.buyer.platformScore}/100
                      </span>
                    </div>
                    <button
                      onClick={() => handleMessageUser(order.order.buyerId)}
                      className="w-full mt-2 text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Message Buyer
                    </button>
                  </div>
                </Card>

                {/* Farmer Contact Card */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Farmer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 block text-sm">Name</span>
                      <span className="font-semibold">
                        {order.farmer.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-sm">Phone</span>
                      <span className="font-semibold">
                        {order.farmer.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-sm">Rating</span>
                      <span className="font-semibold">
                        ⭐ {order.farmer.platformScore}/100
                      </span>
                    </div>
                    <button
                      onClick={() => handleMessageUser(order.order.farmerId)}
                      className="w-full mt-2 text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Message Farmer
                    </button>
                  </div>
                </Card>
              </>
            ) : (
              /* Contact Info for Buyers and Farmers */
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {isBuyer ? "Seller Information" : "Buyer Information"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 block text-sm">Name</span>
                    <span className="font-semibold">
                      {isBuyer ? order.farmer.fullName : order.buyer.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-sm">Phone</span>
                    <span className="font-semibold">
                      {isBuyer ? order.farmer.phone : order.buyer.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-sm">Rating</span>
                    <span className="font-semibold">
                      ⭐{" "}
                      {isBuyer
                        ? order.farmer.platformScore
                        : order.buyer.platformScore}
                      /100
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleMessageUser(
                        isBuyer ? order.order.farmerId : order.order.buyerId,
                      )
                    }
                    className="w-full mt-2 text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Message {isBuyer ? "Farmer" : "Buyer"}
                  </button>
                </div>
              </Card>
            )}

            {/* Price Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Price Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price</span>
                  <span className="font-semibold">
                    ${parseFloat(order.order.totalAmount).toFixed(2)}
                  </span>
                </div>
                {order.transporter && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Cost</span>
                    <span className="font-semibold">
                      ${parseFloat(order.order.transportCost || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-green text-xl">
                    $
                    {(
                      parseFloat(order.order.totalAmount) +
                      parseFloat(order.order.transportCost || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.order.status !== "delivered" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    💰 Payment Protection
                  </p>
                  <p className="text-blue-800 text-xs">
                    {order.order.status === "pending"
                      ? "No funds have been charged yet. Payment will be held in escrow only after farmer approval."
                      : "Funds are held in escrow until delivery is confirmed."}
                  </p>
                </div>
              )}
            </Card>

            {/* Buyer delivery password management */}
            {isBuyer && hasDeliveryPassword !== null && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-800">🔑 Delivery Password</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${hasDeliveryPassword ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {hasDeliveryPassword ? "Set" : "Not set"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Used by the farmer or transporter to confirm receipt on your behalf at handoff.
                </p>
                <button onClick={() => setShowPasswordSetup(true)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {hasDeliveryPassword ? "Change Password" : "Set Password"}
                </button>
              </Card>
            )}

            {/* ── HANDOFF CONFIRM CARD (farmer or transporter) ── */}
            {canInitiateHandoff && (
              <Card className="p-6 border-2 border-green-300 bg-green-50">
                <h3 className="text-lg font-bold text-gray-800 mb-2">📱 Handoff Confirmation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hand your phone to the buyer. They enter their delivery password to instantly release payment — no app-switching needed.
                </p>
                <Button variant="primary" className="w-full" onClick={() => { setShowHandoffModal(true); setHandoffPassword(""); setHandoffError(""); setHandoffSuccess(false); }}>
                  🔑 Confirm Handoff with Buyer's Password
                </Button>
                {isBuyer && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Or the buyer can <button className="text-green-600 underline" onClick={handleConfirmDelivery}>confirm from their own account</button>
                  </p>
                )}
              </Card>
            )}

            {/* Buyer Actions - Delivery Confirmation */}
            {isBuyer && (
              <>
                {order.order.status === "delivered" ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Actions
                    </h3>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleConfirmDelivery}
                      isLoading={actionLoading}
                      disabled={actionLoading}
                    >
                      {order.order.usesTransport
                        ? "✅ Confirm Receipt & Release Payment"
                        : "✅ Confirm Collection & Release Payment"}
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      {order.order.usesTransport
                        ? "Only confirm after you've received and inspected the goods. This will release the payment to the seller."
                        : "Only confirm after you've collected and inspected the goods. This will release the payment to the seller."}
                    </p>
                  </Card>
                ) : order.order.status === "in_transit" ? (
                  <Card className="p-6">
                    <div
                      className={`${
                        order.order.usesTransport
                          ? "bg-blue-50 border-blue-200"
                          : "bg-green-50 border-green-200"
                      } border rounded p-4 text-center`}
                    >
                      <p className="text-2xl mb-2">
                        {order.order.usesTransport ? "🚚" : "📦"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          order.order.usesTransport
                            ? "text-blue-800"
                            : "text-green-800"
                        }`}
                      >
                        {order.order.usesTransport
                          ? "Order In Transit"
                          : "Ready for Collection"}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          order.order.usesTransport
                            ? "text-blue-700"
                            : "text-green-700"
                        }`}
                      >
                        {order.order.usesTransport
                          ? "Your order is on its way! You'll be able to confirm delivery once it arrives."
                          : "Your order is ready! You can collect it from the farmer's location."}
                      </p>
                    </div>
                  </Card>
                ) : canBuyerSelectTransporter ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Transport Selection Required
                    </h3>
                    <div className="bg-purple-50 border border-purple-200 rounded p-4 text-center">
                      <p className="text-2xl mb-2">🚚</p>
                      <p className="text-sm text-purple-800 font-semibold">
                        Farmer Approved - Select Transporters
                      </p>
                      <p className="text-xs text-purple-700 mt-2 mb-4">
                        Your order is approved and funds are secured in escrow.
                        Select transporters now so delivery can begin.
                      </p>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => setShowTransporterSelection(true)}
                      >
                        🚛 Select Transporters
                      </Button>
                    </div>
                  </Card>
                ) : order.order.status === "paid" ||
                  order.order.status === "assigned" ? (
                  <Card className="p-6">
                    <div className="bg-amber-50 border border-amber-200 rounded p-4 text-center">
                      <p className="text-2xl mb-2">📦</p>
                      <p className="text-sm text-amber-800 font-semibold">
                        Order Being Prepared
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        The farmer is preparing your order for{" "}
                        {order.order.usesTransport ? "delivery" : "pickup"}.
                      </p>
                    </div>
                  </Card>
                ) : order.order.status === "pending" ? (
                  <Card className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                      <p className="text-2xl mb-2">⏳</p>
                      <p className="text-sm text-yellow-800 font-semibold">
                        Waiting for Farmer Approval
                      </p>
                      <p className="text-xs text-yellow-700 mt-2">
                        Your order has been sent to the farmer. No payment has
                        been processed yet.
                      </p>
                    </div>
                  </Card>
                ) : null}
              </>
            )}

            {/* Farmer Approval Actions */}
            {isFarmer && order.order.status === "pending" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="text-sm text-yellow-800 font-semibold">
                    Approval Required
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Approve to secure buyer payment in escrow, or decline if the
                    stock is no longer available.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleApproveOrder}
                    isLoading={actionLoading}
                    disabled={actionLoading}
                  >
                    ✅ Approve Order
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleDeclineOrder}
                    isLoading={actionLoading}
                    disabled={actionLoading}
                  >
                    ❌ Decline Order
                  </Button>
                </div>
              </Card>
            )}

            {/* Farmer Actions */}
            {isFarmer &&
              (order.order.status === "paid" ||
                order.order.status === "pending_transport") && (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Actions
                  </h3>

                  {/* Check if order uses platform transport and no transporter assigned yet */}
                  {order.order.usesTransport && !order.transporter ? (
                    <>
                      {order.order.status === "pending_transport" ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                          <p className="text-sm text-blue-800 font-semibold">
                            ⏳ Waiting for Transporter Response
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            The buyer has sent offers to transporters. They will
                            accept or decline within 24 hours.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                            <p className="text-sm text-purple-800 font-semibold">
                              🔄 Buyer is Selecting Transporters
                            </p>
                            <p className="text-xs text-purple-700 mt-1">
                              The buyer will choose transporters using AI matching.
                              You'll be notified once a transporter accepts.
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  ) : order.order.usesTransport && order.transporter ? (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                        <p className="text-sm text-green-800 font-semibold">
                          ✅ Transporter Assigned:{" "}
                          {order.transporter.businessName ||
                            order.transporter.fullName}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Contact: {order.transporter.phone}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleMarkInTransit}
                        isLoading={actionLoading}
                        disabled={actionLoading}
                      >
                        🚚 Mark as Dispatched
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        Mark as dispatched once goods are handed over to the
                        transporter.
                      </p>
                    </>
                  ) : (
                    /* Self pickup - no transporter needed */
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                        <p className="text-sm text-amber-800 font-semibold">
                          📍 Self Pickup Order
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Buyer will collect from: {order.listing?.location}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleMarkInTransit}
                        isLoading={actionLoading}
                        disabled={actionLoading}
                      >
                        📦 Mark as Ready for Pickup
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        Mark when goods are ready for the buyer to collect.
                      </p>
                    </>
                  )}
                </Card>
              )}

            {/* Assigned status - waiting for dispatch */}
            {isFarmer && order.order.status === "assigned" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Actions
                </h3>
                {order.transporter && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ Transporter:{" "}
                      {order.transporter.businessName ||
                        order.transporter.fullName}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Contact: {order.transporter.phone}
                    </p>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleMarkInTransit}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  🚚 Mark as Dispatched
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Mark as dispatched once goods are handed over for delivery.
                </p>
              </Card>
            )}

            {isFarmer && order.order.status === "in_transit" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Actions
                </h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleMarkDelivered}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  {order.order.usesTransport
                    ? "📦 Mark as Delivered"
                    : "✅ Order Collected"}
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  {order.order.usesTransport
                    ? "Mark as delivered once the buyer has received the goods."
                    : "Confirm once the buyer has collected the goods."}
                </p>
              </Card>
            )}

            {/* Transporter Actions - Assigned status (picked up from farmer) */}
            {isTransporter && order.order.status === "assigned" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🚚 Transporter Actions
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm text-blue-800 font-semibold">
                    📍 Pickup Location
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {order.transport?.pickupLocation}
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleMarkInTransit}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  ✅ Confirm Pickup
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Confirm once you have picked up the goods from the farmer.
                </p>
              </Card>
            )}

            {/* Transporter Actions - In Transit (picked up, on the way) */}
            {isTransporter && order.order.status === "in_transit" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🚚 Transporter Actions
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ Goods Picked Up
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      From: {order.transport?.pickupLocation}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800 font-semibold">
                      📍 Delivery Location
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {order.transport?.deliveryLocation}
                    </p>
                  </div>
                </div>
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleMarkDelivered}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  ✅ Confirm Delivery
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Confirm once you have delivered the goods to the buyer.
                </p>
              </Card>
            )}

            {/* Transporter - Delivered (waiting for buyer confirmation) */}
            {isTransporter && order.order.status === "delivered" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🚚 Delivery Status
                </h3>
                <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm text-green-800 font-semibold">
                    Delivery Confirmed
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Waiting for buyer to confirm receipt. Payment will be
                    released after confirmation.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── HANDOFF MODAL ── */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {handoffSuccess ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-bold text-green-700">Payment Released!</h2>
                <p className="text-gray-600 text-sm mt-2">Transaction complete. Thank you!</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Buyer Confirmation</h2>
                <p className="text-sm text-gray-500 text-center mb-5">
                  Hand this phone to the buyer. They enter their delivery password to release payment.
                </p>

                <form onSubmit={handleHandoffConfirm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                      🔑 Delivery Password
                    </label>
                    <input
                      type="password"
                      value={handoffPassword}
                      onChange={(e) => setHandoffPassword(e.target.value)}
                      placeholder="Enter your delivery password"
                      autoComplete="off"
                      autoFocus
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-lg tracking-widest focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  {handoffError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm text-center">
                      {handoffError}
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full py-3 text-base" isLoading={handoffLoading} disabled={handoffLoading}>
                    ✅ Confirm & Release Payment
                  </Button>

                  <button type="button" onClick={() => setShowHandoffModal(false)} className="w-full text-gray-500 hover:text-gray-700 text-sm py-2">
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── DELIVERY PASSWORD SETUP MODAL ── */}
      {showPasswordSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🔑 {hasDeliveryPassword ? "Change" : "Set"} Delivery Password</h2>
            <p className="text-sm text-gray-500 mb-5">
              This password is only used at the point of delivery — the farmer or transporter will enter it on your behalf.
            </p>

            <form onSubmit={handleSetDeliveryPassword} className="space-y-4">
              {hasDeliveryPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Enter current delivery password" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="At least 4 characters" minLength={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {passwordSetupError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{passwordSetupError}</div>}
              {passwordSetupSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">{passwordSetupSuccess}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowPasswordSetup(false); setPasswordSetupError(""); setPasswordSetupSuccess(""); }} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={passwordSetupLoading} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {passwordSetupLoading ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BuyerTransporterSelectionModal
        orderId={order.order.id}
        pickupLocation={order.listing?.location || ""}
        isOpen={showTransporterSelection}
        onCancel={() => setShowTransporterSelection(false)}
        onSuccess={() => {
          setShowTransporterSelection(false);
          setSuccessMessage(
            "✅ Transporter offers sent. You'll be notified when one accepts.",
          );
          fetchOrderDetails();
        }}
      />
    </div>
  );
};

export default OrderDetail;
