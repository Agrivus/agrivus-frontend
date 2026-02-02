import React, { useState, useEffect } from "react";
import { ordersService } from "../../services/ordersService";

interface TransportOffer {
  offerId: string;
  orderId: string;
  pickupLocation: string;
  deliveryLocation: string;
  transportCost: string;
  counterFee?: string | null;
  counteredAt?: string;
  status: "pending" | "accepted" | "declined" | "countered";
  tier: "primary" | "secondary" | "tertiary";
  isActive: boolean;
  offeredAt: string;
  respondedAt?: string;
  sentToPrimaryAt: string;
  sentToSecondaryAt?: string;
  sentToTertiaryAt?: string;
  farmer: {
    id: string;
    fullName: string;
    phone: string;
  };
  listing?: {
    name: string;
    location: string;
  };
}

interface TransportOffersProps {
  defaultStatus?: "pending" | "accepted" | "declined" | "countered";
}

export const TransportOffers: React.FC<TransportOffersProps> = ({
  defaultStatus = "pending",
}) => {
  const [offers, setOffers] = useState<TransportOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "accepted" | "declined" | "countered"
  >(defaultStatus);
  const [actingOnOfferId, setActingOnOfferId] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
    // Refresh every 30 seconds
    const interval = setInterval(loadOffers, 30000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.getTransportOffers(selectedStatus);
      setOffers(response.data?.offers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    try {
      setActingOnOfferId(offerId);
      await ordersService.acceptTransportOffer(offerId);
      // Show success and reload
      setTimeout(() => {
        loadOffers();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept offer");
      setActingOnOfferId(null);
    }
  };

  const handleCounter = async (offerId: string) => {
    const input = window.prompt("Enter your counter fee (KES):");
    if (!input) return;

    const counterFee = parseFloat(input);
    if (Number.isNaN(counterFee)) {
      setError("Invalid counter fee amount");
      return;
    }

    try {
      setActingOnOfferId(offerId);
      await ordersService.counterTransportOffer(offerId, counterFee);
      setTimeout(() => {
        loadOffers();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to counter offer");
    } finally {
      setActingOnOfferId(null);
    }
  };

  const handleDecline = async (offerId: string, reason?: string) => {
    try {
      setActingOnOfferId(offerId);
      await ordersService.declineTransportOffer(offerId, reason);
      setTimeout(() => {
        loadOffers();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline offer");
      setActingOnOfferId(null);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "primary":
        return "bg-green-100 text-green-800 border-green-300";
      case "secondary":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "tertiary":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "primary":
        return "🚀 Tier 1 (Priority)";
      case "secondary":
        return "⏰ Tier 2 (Next)";
      case "tertiary":
        return "🎯 Tier 3 (Final)";
      default:
        return tier;
    }
  };

  const getTimeRemaining = (sentAt: string, isActive: boolean): string => {
    if (!isActive) return "Waiting...";

    const sent = new Date(sentAt);
    const oneHourLater = new Date(sent.getTime() + 60 * 60 * 1000);
    const now = new Date();

    if (now >= oneHourLater) {
      return "Time expired (other tiers active)";
    }

    const minutesRemaining = Math.floor(
      (oneHourLater.getTime() - now.getTime()) / (1000 * 60),
    );
    return `${minutesRemaining}m remaining`;
  };

  if (loading && offers.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading transport offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Transport Offers
        </h2>
        <p className="text-gray-600">
          Manage your transport offers and earn +3 platform score for each
          acceptance
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "accepted", "declined", "countered"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStatus === status
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status === "pending"
                ? `📋 Pending (${offers.filter((o) => o.status === status).length})`
                : status === "accepted"
                  ? `✅ Accepted (${offers.filter((o) => o.status === status).length})`
                  : status === "countered"
                    ? `💬 Countered (${offers.filter((o) => o.status === status).length})`
                    : `❌ Declined (${offers.filter((o) => o.status === status).length})`}
            </button>
          ),
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <span className="text-2xl text-red-600 flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <span className="text-6xl mx-auto mb-4 inline-block">🕐</span>
          <p className="text-gray-600 font-medium">
            {selectedStatus === "pending"
              ? "No pending offers"
              : selectedStatus === "accepted"
                ? "No accepted offers yet"
                : selectedStatus === "countered"
                  ? "No countered offers"
                  : "No declined offers"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedStatus === "pending"
              ? "Check back soon for new transport opportunities"
              : "Your accepted offers will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.offerId}
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                offer.status === "pending"
                  ? offer.isActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                  : offer.status === "accepted"
                    ? "border-blue-500 bg-blue-50"
                    : "border-red-300 bg-gray-50"
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-current border-opacity-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierBadgeColor(
                          offer.tier,
                        )}`}
                      >
                        {getTierLabel(offer.tier)}
                      </span>
                      {offer.isActive && offer.status === "pending" && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          ⭐ Active Now
                        </span>
                      )}
                      {offer.status === "accepted" && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                          ✅ Accepted
                        </span>
                      )}
                      {offer.status === "countered" && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1">
                          💬 Countered
                        </span>
                      )}
                      {offer.status === "declined" && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                          ❌ Declined
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {offer.listing?.name || "Transport Offer"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order: {offer.orderId.substring(0, 8)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      KES {parseFloat(offer.transportCost).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Transport Cost</p>
                  </div>
                </div>

                {/* Active Tier Time Indicator */}
                {offer.status === "pending" && (
                  <div className="text-sm">
                    {offer.isActive ? (
                      <div className="text-green-700 font-semibold">
                        ⏱️{" "}
                        {getTimeRemaining(
                          offer.sentToPrimaryAt,
                          offer.tier === "primary",
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        🕐 Waiting for your tier to activate...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Location Info */}
              <div className="px-4 py-3 bg-white bg-opacity-50">
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="text-xl text-blue-600">📍</span>
                    <div>
                      <p className="text-xs text-gray-600">Pickup</p>
                      <p className="font-medium text-gray-900">
                        {offer.pickupLocation}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl text-red-600">📍</span>
                    <div>
                      <p className="text-xs text-gray-600">Delivery</p>
                      <p className="font-medium text-gray-900">
                        {offer.deliveryLocation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Info */}
              <div className="px-4 py-3 border-t border-current border-opacity-10">
                <p className="text-xs text-gray-600 mb-2">Farmer</p>
                <div className="bg-white bg-opacity-70 p-2 rounded">
                  <p className="font-semibold text-gray-900">
                    {offer.farmer.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{offer.farmer.phone}</p>
                </div>
              </div>

              {/* Escalation Timeline */}
              {offer.status === "pending" && (
                <div className="px-4 py-3 border-t border-current border-opacity-10">
                  <p className="text-xs text-gray-600 mb-2 font-semibold">
                    Cascade Timeline
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          offer.tier === "primary"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-600">
                        Tier 1:{" "}
                        {new Date(offer.sentToPrimaryAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {offer.sentToSecondaryAt && (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            offer.tier === "secondary"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-600">
                          Tier 2:{" "}
                          {new Date(
                            offer.sentToSecondaryAt,
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    {offer.sentToTertiaryAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <span className="text-xs text-gray-600">
                          Tier 3:{" "}
                          {new Date(
                            offer.sentToTertiaryAt,
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {offer.status === "pending" && offer.isActive && (
                <div className="px-4 py-3 bg-white border-t border-current border-opacity-10 flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleAccept(offer.offerId)}
                    disabled={actingOnOfferId === offer.offerId}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {actingOnOfferId === offer.offerId ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Accepting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        ✅ Accept Offer
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleCounter(offer.offerId)}
                    disabled={actingOnOfferId === offer.offerId}
                    className="flex-1 px-4 py-2 border border-orange-500 text-orange-700 rounded-lg hover:bg-orange-50 disabled:bg-gray-100 disabled:text-gray-400 font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {actingOnOfferId === offer.offerId ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        💬 Counter Fee
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleDecline(offer.offerId)}
                    disabled={actingOnOfferId === offer.offerId}
                    className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {actingOnOfferId === offer.offerId ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        Declining...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        ❌ Decline
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Completed Status */}
              {offer.status !== "pending" && (
                <div className="px-4 py-3 bg-white border-t border-current border-opacity-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {offer.status === "accepted"
                        ? "✅ Offer Accepted"
                        : offer.status === "countered"
                          ? `💬 Countered: KES ${offer.counterFee || offer.transportCost}`
                          : "❌ Offer Declined"}
                    </span>
                    {offer.respondedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(offer.respondedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {selectedStatus === "pending" && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <span className="text-2xl">📈</span>
            <div className="text-sm text-blue-700">
              <p className="font-semibold">Earn +3 Platform Score</p>
              <p className="mt-1">
                Accept any offer to boost your platform score and increase
                visibility in future matches!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
