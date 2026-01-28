import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, LoadingSpinner } from "../components/common";
import paymentService from "../services/paymentService";

const MockPayment: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentId]);

  useEffect(() => {
    if (processing && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (processing && countdown === 0) {
      // Auto-complete mock payment
      handleComplete();
    }
  }, [processing, countdown]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentService.checkStatus(paymentId!);
      setPayment(response.data);
    } catch (error) {
      console.error("Failed to load payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setProcessing(true);
  };

  const handleComplete = async () => {
    try {
      // For cash deposits, don't auto-complete - mark as pending
      if (payment?.paymentMethod === "cash") {
        navigate("/wallet?payment=pending");
      } else {
        // Poll until completed for other methods
        await paymentService.pollPaymentStatus(paymentId!, (status) => {
          console.log("Payment status:", status);
        });
        navigate("/wallet?payment=success");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      navigate("/wallet?payment=failed");
    }
  };

  const handleCancel = () => {
    navigate("/wallet?payment=cancelled");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          {payment?.paymentMethod === "cash" ? (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-5xl">💰</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Deposit Submitted
              </h2>
              <p className="text-gray-600 mb-6">
                Your cash deposit of{" "}
                <strong>${payment?.amount?.toFixed(2)}</strong> has been
                submitted for verification.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  Next Steps:
                </p>
                <ol className="text-sm text-blue-800 text-left space-y-2 list-decimal list-inside">
                  <li>Your deposit is now pending admin verification</li>
                  <li>You will receive a notification once verified</li>
                  <li>Funds will appear in your wallet after verification</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                <strong>Reference:</strong> {payment?.reference}
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/wallet")}
              >
                Return to Wallet
              </Button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <LoadingSpinner size="lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Processing Payment...
              </h2>
              <p className="text-gray-600 mb-6">
                Simulating {payment?.paymentMethod?.toUpperCase() || "PAYMENT"}{" "}
                gateway
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-semibold">
                  Payment will complete in {countdown} seconds
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  In production, you would complete this on the actual payment
                  gateway
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="p-8 max-w-lg w-full">
        {payment?.paymentMethod === "cash" ? (
          <>
            {/* Cash Deposit Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Cash Deposit</h1>
              <p className="text-sm text-gray-600 mt-2">
                Confirm your cash deposit details
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">
                    ${payment?.amount?.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {payment?.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Type:</span>
                  <span className="font-semibold text-gray-900">Cash</span>
                </div>
              </div>
            </div>

            {/* Cash Deposit Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">
                Cash Deposit Process:
              </h3>
              <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                <li>
                  You have handed the cash to our authorized company stakeholder
                </li>
                <li>
                  Click "Confirm Deposit" to submit your deposit for
                  verification
                </li>
                <li>
                  Your deposit will be marked as pending admin verification
                </li>
                <li>
                  You'll receive a notification when the deposit is verified
                </li>
                <li>Funds will appear in your wallet after verification</li>
              </ol>
            </div>

            {/* Professional Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>📋 Please Note:</strong> Cash deposits are currently the
                only supported way to add funds to your wallet. Additional
                electronic payment methods will be made available in a future
                release.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleApprove}
              >
                ✓ Confirm Deposit
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                ✕ Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Other Payment Methods - Coming Soon Notice */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏸️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Method Suspended
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Temporarily unavailable
              </p>
            </div>

            {/* Suspension Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-amber-900 mb-3">
                📋 Service Notice
              </h3>
              <p className="text-sm text-amber-800 mb-4">
                Alternative payment methods are temporarily unavailable while we
                complete payment platform upgrades. Cash deposits remain fully
                supported and will be processed as usual.
              </p>
              <p className="text-sm text-amber-800 font-semibold">
                Currently Available: Cash Deposits Only
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                ✕ Return to Wallet
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default MockPayment;
