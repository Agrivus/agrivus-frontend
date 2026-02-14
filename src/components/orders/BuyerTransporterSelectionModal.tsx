import React, { useState, useEffect } from "react";
import { ordersService } from "../../services/ordersService";
import { getErrorMessage } from "../../utils/errorHandler";

interface Transporter {
  transporterId: string;
  transporter: {
    fullName: string;
    phone: string;
    email: string;
    platformScore: number;
    vehicleType: string;
    vehicleCapacity: string;
    baseLocation: string;
    rating: number | string;
    completedDeliveries: number;
    onTimeDeliveryRate: number | string;
  };
  matchScore: number;
  matchReasons: {
    highPlatformActivity: boolean;
    serviceAreaMatch: boolean;
    goodRating: boolean;
    experienced: boolean;
  };
}

interface BuyerTransporterSelectionModalProps {
  orderId: string;
  pickupLocation: string;
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const BuyerTransporterSelectionModal: React.FC<
  BuyerTransporterSelectionModalProps
> = ({ orderId, pickupLocation, onSuccess, onCancel, isOpen }) => {
  const [step, setStep] = useState<
    | "select-primary"
    | "select-secondary"
    | "select-tertiary"
    | "summary"
    | "loading"
  >("select-primary");
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [primarySelected, setPrimarySelected] = useState<string | null>(null);
  const [secondarySelected, setSecondarySelected] = useState<string | null>(
    null,
  );
  const [tertiarySelected, setTertiarySelected] = useState<string | null>(null);

  const [proposedFee, setProposedFee] = useState<string>("");
  const [minimumFee, setMinimumFee] = useState<number>(187.5);
  const [feeError, setFeeError] = useState<string | null>(null);
  const isSingleTransporter = transporters.length <= 1;
  const steps = isSingleTransporter
    ? ["select-primary", "summary"]
    : ["select-primary", "select-secondary", "select-tertiary", "summary"];

  useEffect(() => {
    if (isOpen && orderId) {
      loadTransporters();
    }
  }, [orderId, isOpen]);

  const loadTransporters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.matchTransporter(orderId);
      if (response.data?.matches) {
        setTransporters(response.data.matches);
      }
      const feeData = response.data as
        | (typeof response.data & { minimumFee?: number })
        | undefined;
      if (feeData?.minimumFee) {
        setMinimumFee(feeData.minimumFee);
        setProposedFee(feeData.minimumFee.toString());
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load transporters"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!primarySelected) {
      setError("Primary transporter is required");
      return;
    }

    if (!isSingleTransporter && !secondarySelected && !tertiarySelected) {
      setError("Please select at least 2 transporters");
      return;
    }

    if (!proposedFee) {
      setFeeError("Please enter a transport fee");
      return;
    }

    const feeValue = parseFloat(proposedFee);
    if (Number.isNaN(feeValue)) {
      setFeeError("Invalid fee amount");
      return;
    }

    if (feeValue < minimumFee) {
      setFeeError(`Fee must be at least KES ${minimumFee.toFixed(2)}`);
      return;
    }

    try {
      setFeeError(null);
      setStep("loading");
      setError(null);

      await ordersService.assignTransporter(orderId, {
        primaryTransporterId: primarySelected,
        secondaryTransporterId: secondarySelected || undefined,
        tertiaryTransporterId: tertiarySelected || undefined,
        transportCost: feeValue.toString(),
        pickupLocation,
      });

      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to assign transporters"));
      setStep("summary");
    }
  };

  const renderTransporterCard = (
    t: Transporter,
    isSelected: boolean,
    onSelect: () => void,
  ) => {
    return (
      <div
        key={t.transporterId}
        onClick={onSelect}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "border-green-500 bg-green-50"
            : "border-gray-200 hover:border-green-300 bg-white"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">
              {t.transporter.fullName}
            </h4>
            <p className="text-sm text-gray-600">{t.transporter.vehicleType}</p>
          </div>
          {isSelected && <span className="text-2xl text-green-500">✓</span>}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <p className="text-gray-600">Score</p>
            <p className="font-semibold text-lg">
              {t.transporter.platformScore}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Rating</p>
            <div className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <p className="font-semibold">
                {typeof t.transporter.rating === "string"
                  ? parseFloat(t.transporter.rating).toFixed(1)
                  : t.transporter.rating.toFixed(1)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Capacity</p>
            <p className="font-semibold">{t.transporter.vehicleCapacity}</p>
          </div>
          <div>
            <p className="text-gray-600">Deliveries</p>
            <p className="font-semibold">{t.transporter.completedDeliveries}</p>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {t.matchReasons.highPlatformActivity && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Active User
            </span>
          )}
          {t.matchReasons.serviceAreaMatch && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Service Area Match
            </span>
          )}
          {t.matchReasons.goodRating && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              Top Rated
            </span>
          )}
          {t.matchReasons.experienced && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              Experienced
            </span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">Match Score</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">🏆</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min(t.matchScore, 100)}%` }}
              ></div>
            </div>
            <span className="font-semibold text-sm">{t.matchScore}%</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Finding best transporters...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-green-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">
                🚚 Select Your Transporters
              </h2>
              <p className="text-green-100">
                {isSingleTransporter
                  ? "Only one transporter is available right now. You can proceed with a single priority offer."
                  : "Choose up to 3 transporters in priority order. Tier 1 gets first chance, then Tier 2, then Tier 3."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-6">
              <div className="flex gap-2 mb-6">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`flex-1 h-2 rounded-full ${
                        steps.indexOf(step) >= i
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    ></div>
                    {i < steps.length - 1 && <div className="w-2"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <span className="text-2xl text-red-600 flex-shrink-0">
                    ⚠️
                  </span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {step === "select-primary" && (
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    🚀 Tier 1: Primary Transporter
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    This transporter gets priority access for 1 hour. Select
                    your top choice.
                  </p>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transporters.map((t) =>
                      renderTransporterCard(
                        t,
                        primarySelected === t.transporterId,
                        () => setPrimarySelected(t.transporterId),
                      ),
                    )}
                  </div>
                </div>
              )}

              {step === "select-secondary" && (
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    ⏰ Tier 2: Secondary Transporter
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    If primary doesn't respond within 1 hour, offer goes to this
                    transporter.
                  </p>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transporters
                      .filter((t) => t.transporterId !== primarySelected)
                      .map((t) =>
                        renderTransporterCard(
                          t,
                          secondarySelected === t.transporterId,
                          () => setSecondarySelected(t.transporterId),
                        ),
                      )}
                  </div>
                </div>
              )}

              {step === "select-tertiary" && (
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    🎯 Tier 3: Tertiary Transporter (Optional)
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    If secondary also doesn't respond, offer goes here. Leave
                    empty if you only want 2 tiers.
                  </p>
                  <button
                    onClick={() => setTertiarySelected(null)}
                    className="mb-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Skip Tier 3
                  </button>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transporters
                      .filter(
                        (t) =>
                          t.transporterId !== primarySelected &&
                          t.transporterId !== secondarySelected,
                      )
                      .map((t) =>
                        renderTransporterCard(
                          t,
                          tertiarySelected === t.transporterId,
                          () => setTertiarySelected(t.transporterId),
                        ),
                      )}
                  </div>
                </div>
              )}

              {step === "summary" && (
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    Review Your Selections
                  </h3>

                  <div className="space-y-4">
                    {/* Tier 1 */}
                    <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                          Tier 1
                        </span>
                        <span className="text-sm text-gray-600">
                          (Priority - 1 hour exclusive)
                        </span>
                      </div>
                      {primarySelected && (
                        <div>
                          <p className="font-semibold">
                            {
                              transporters.find(
                                (t) => t.transporterId === primarySelected,
                              )?.transporter.fullName
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {
                              transporters.find(
                                (t) => t.transporterId === primarySelected,
                              )?.transporter.vehicleType
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {!isSingleTransporter && (
                      <>
                        {/* Tier 2 */}
                        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                              Tier 2
                            </span>
                            <span className="text-sm text-gray-600">
                              (After 1 hour)
                            </span>
                          </div>
                          {secondarySelected ? (
                            <div>
                              <p className="font-semibold">
                                {
                                  transporters.find(
                                    (t) =>
                                      t.transporterId === secondarySelected,
                                  )?.transporter.fullName
                                }
                              </p>
                              <p className="text-sm text-gray-600">
                                {
                                  transporters.find(
                                    (t) =>
                                      t.transporterId === secondarySelected,
                                  )?.transporter.vehicleType
                                }
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm italic">
                              Not selected
                            </p>
                          )}
                        </div>

                        {/* Tier 3 */}
                        {tertiarySelected && (
                          <div className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-purple-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                                Tier 3
                              </span>
                              <span className="text-sm text-gray-600">
                                (After 2 hours)
                              </span>
                            </div>
                            <p className="font-semibold">
                              {
                                transporters.find(
                                  (t) => t.transporterId === tertiarySelected,
                                )?.transporter.fullName
                              }
                            </p>
                            <p className="text-sm text-gray-600">
                              {
                                transporters.find(
                                  (t) => t.transporterId === tertiarySelected,
                                )?.transporter.vehicleType
                              }
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* How It Works */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">
                        How Cascading Works:
                      </h4>
                      {isSingleTransporter ? (
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Only one transporter is available right now</li>
                          <li>✓ The offer will be sent immediately</li>
                          <li>
                            ✓ First to accept wins! Assigned transporter gets
                            the job
                          </li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Hour 0: Tier 1 gets exclusive 1-hour window</li>
                          <li>
                            ✓ Hour 1: Tier 2 activated (Tier 1 still can
                            accept)
                          </li>
                          <li>
                            ✓ Hour 2: Tier 3 activated (all tiers still can
                            accept)
                          </li>
                          <li>
                            ✓ First to accept wins! Assigned transporter gets
                            the job
                          </li>
                        </ul>
                      )}
                    </div>

                    {/* Cost Summary */}
                    <div className="p-4 bg-gray-100 rounded-lg space-y-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Proposed Transport Fee (KES)
                        </label>
                        <input
                          type="number"
                          min={minimumFee}
                          value={proposedFee}
                          onChange={(e) => setProposedFee(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder={`Minimum KES ${minimumFee.toFixed(2)}`}
                        />
                        <p className="text-xs text-gray-600">
                          Minimum fee: KES {minimumFee.toFixed(2)} (based on
                          distance + weight)
                        </p>
                        {feeError && (
                          <p className="text-xs text-red-600">{feeError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === "loading" && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-gray-600">
                      Sending offers to transporters...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>

              {step !== "loading" && (
                <>
                  {step !== "select-primary" && (
                    <button
                      onClick={() => {
                        if (step === "summary") {
                          if (isSingleTransporter) {
                            setStep("select-primary");
                            return;
                          }
                          setTertiarySelected(null);
                          setStep("select-tertiary");
                        } else if (step === "select-tertiary") {
                          setStep("select-secondary");
                        } else if (step === "select-secondary") {
                          setStep("select-primary");
                        }
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Back
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (step === "select-primary") {
                        if (!primarySelected) {
                          setError("Please select a primary transporter");
                          return;
                        }
                        if (isSingleTransporter) {
                          setStep("summary");
                          return;
                        }
                        setStep("select-secondary");
                      } else if (step === "select-secondary") {
                        if (!secondarySelected) {
                          setError("Please select a secondary transporter");
                          return;
                        }
                        setStep("select-tertiary");
                      } else if (step === "select-tertiary") {
                        setStep("summary");
                      } else if (step === "summary") {
                        handleSubmit();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                  >
                    {step === "summary"
                      ? "Confirm & Send Offers"
                      : "Next"}
                    <span>→</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
