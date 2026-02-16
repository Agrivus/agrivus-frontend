import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ordersService } from "../services/ordersService";
import { getErrorMessage } from "../utils/errorHandler";

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

const TransportOffers: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<TransportOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "pending" | "accepted" | "declined" | "countered"
  >("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<{ [key: string]: string }>(
    {},
  );
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState<{ [key: string]: string }>(
    {},
  );
  const [showCounterModal, setShowCounterModal] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "transporter") {
      fetchOffers();
    }
  }, [user, activeFilter]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await ordersService.getTransportOffers(activeFilter);
      if (response.success && response.data) {
        setOffers(response.data.offers);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to load transport offers"));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setActionLoading(offerId);
      const response = await ordersService.acceptTransportOffer(offerId);
      if (response.success) {
        alert("✅ Offer accepted! You have been assigned to this order.");
        fetchOffers();
      }
    } catch (err: any) {
      alert("Error accepting offer: " + (err.message || "Unknown error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      setActionLoading(offerId);
      const response = await ordersService.declineTransportOffer(
        offerId,
        declineReason[offerId],
      );
      if (response.success) {
        alert("Offer declined");
        setShowDeclineModal(null);
        setDeclineReason({ ...declineReason, [offerId]: "" });
        fetchOffers();
      }
    } catch (err: any) {
      alert("Error declining offer: " + (err.message || "Unknown error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterOffer = async (offerId: string) => {
    const amount = counterAmount[offerId];
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid counter amount");
      return;
    }

    try {
      setActionLoading(offerId);
      const response = await ordersService.counterTransportOffer(
        offerId,
        parseFloat(amount),
      );
      if (response.success) {
        alert("✅ Counter offer sent to farmer! They will review your proposal.");
        setShowCounterModal(null);
        setCounterAmount({ ...counterAmount, [offerId]: "" });
        fetchOffers();
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || "Unknown error";
      alert("Error sending counter offer: " + errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  if (user?.role !== "transporter") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-gray-600">
            This page is only accessible to transporters.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚚 Transport Offers
        </h1>
        <p className="text-gray-600">
          Manage incoming transport offers from farmers
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(["pending", "countered", "accepted", "declined"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded font-semibold transition-all whitespace-nowrap ${
              activeFilter === filter
                ? "bg-primary-green text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {filter === "countered" ? "💰 " : ""}
            {filter.charAt(0).toUpperCase() + filter.slice(1)}{" "}
            {offers.filter((o) => o.status === filter).length > 0 &&
              `(${offers.filter((o) => o.status === filter).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : offers.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">
            {activeFilter === "pending"
              ? "No pending offers at the moment. Check back later!"
              : `No ${activeFilter} offers yet.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.offerId} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {offer.listing?.name || "Order"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Farmer: {offer.farmer.fullName}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    offer.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : offer.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : offer.status === "countered"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {offer.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Pickup Location
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {offer.pickupLocation}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Delivery Location
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {offer.deliveryLocation}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Transport Cost
                  </p>
                  <p className="text-xl font-bold text-primary-green">
                    ${parseFloat(offer.transportCost).toFixed(2)}
                  </p>
                  {offer.counterFee && (
                    <p className="text-sm text-yellow-700 font-semibold mt-1">
                      Your counter: ${parseFloat(offer.counterFee).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Contact
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {offer.farmer.phone}
                  </p>
                </div>
              </div>

              {/* Priority Tier Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  offer.tier === 'primary' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                  offer.tier === 'secondary' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  'bg-purple-100 text-purple-800 border border-purple-300'
                }`}>
                  {offer.tier === 'primary' ? '⭐ Priority Tier 1' : 
                   offer.tier === 'secondary' ? '🥈 Tier 2' : '🥉 Tier 3'}
                  {offer.isActive && ' - YOUR TURN'}
                </span>
              </div>

              {/* Inactive offer message */}
              {!offer.isActive && offer.status === "pending" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    ⏳ This offer is currently with a higher priority transporter. You'll be notified if they decline.
                  </p>
                </div>
              )}

              {/* Action buttons - only show if active */}
              {offer.status === "pending" && offer.isActive && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleAcceptOffer(offer.offerId)}
                      isLoading={actionLoading === offer.offerId}
                      disabled={actionLoading !== null}
                    >
                      ✅ Accept Offer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      onClick={() => setShowCounterModal(offer.offerId)}
                      disabled={actionLoading !== null}
                    >
                      💰 Counter Offer
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeclineModal(offer.offerId)}
                    isLoading={actionLoading === offer.offerId}
                    disabled={actionLoading !== null}
                  >
                    ❌ Decline
                  </Button>
                </div>
              )}

              {offer.status === "accepted" && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✅ You have accepted this offer. The order is now assigned
                    to you.
                  </p>
                </div>
              )}

              {offer.status === "countered" && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-sm text-orange-800">
                    💰 You countered with ${parseFloat(offer.counterFee || "0").toFixed(2)}. Waiting for farmer's response.
                  </p>
                </div>
              )}

              {offer.status === "declined" && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <p className="text-sm text-gray-800">
                    You declined this offer on{" "}
                    {new Date(offer.respondedAt!).toLocaleDateString()}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Decline Offer
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Please tell us why you're declining this offer (optional):
              </p>
              <textarea
                value={declineReason[showDeclineModal] || ""}
                onChange={(e) =>
                  setDeclineReason({
                    ...declineReason,
                    [showDeclineModal]: e.target.value,
                  })
                }
                placeholder="e.g., Vehicle at capacity, too far, mechanical issues..."
                className="w-full p-3 border border-gray-300 rounded mb-4 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                rows={4}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeclineModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleDeclineOffer(showDeclineModal)}
                  isLoading={actionLoading === showDeclineModal}
                >
                  Decline
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                💰 Counter Offer
              </h2>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Current offer:</strong> ${parseFloat(offers.find(o => o.offerId === showCounterModal)?.transportCost || "0").toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Propose your counter amount for this delivery:
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Counter Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={counterAmount[showCounterModal] || ""}
                  onChange={(e) =>
                    setCounterAmount({
                      ...counterAmount,
                      [showCounterModal]: e.target.value,
                    })
                  }
                  placeholder="e.g., 450.00"
                  className="w-full p-3 border border-gray-300 rounded focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-gray-500 mb-4">
                💡 Tip: The farmer will be notified and can accept or decline your counter offer.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCounterModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleCounterOffer(showCounterModal)}
                  isLoading={actionLoading === showCounterModal}
                >
                  Send Counter Offer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TransportOffers;
