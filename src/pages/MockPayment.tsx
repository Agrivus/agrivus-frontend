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
      // In mock mode, payment auto-completes after 5 seconds
      // Poll until completed
      await paymentService.pollPaymentStatus(paymentId!, (status) => {
        console.log("Payment status:", status);
      });

      // Redirect to wallet
      navigate("/wallet?payment=success");
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
          <div className="mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Processing Payment...
          </h2>
          <p className="text-gray-600 mb-6">
            Simulating {payment?.paymentMethod.toUpperCase()} payment gateway
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="p-8 max-w-lg w-full">
        {/* Mock Gateway Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mock Payment Gateway
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Development Mode - Simulating{" "}
            {payment?.paymentMethod?.toUpperCase()}
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
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">
                {payment?.paymentMethod?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions (simulated) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Mock Payment Instructions:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>This is a simulated payment for testing</li>
            <li>Click "Approve Payment" to simulate successful payment</li>
            <li>Payment will auto-complete after 5 seconds</li>
            <li>Your wallet will be credited automatically</li>
          </ol>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Development Mode:</strong> This is a mock payment
            gateway. In production, you'll be redirected to the actual{" "}
            {payment?.paymentMethod?.toUpperCase()} payment page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="primary" className="flex-1" onClick={handleApprove}>
            ✓ Approve Payment
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            ✕ Cancel
          </Button>
        </div>

        {/* Real Payment Info */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            When using Paynow in production, you'll be redirected to their
            secure payment page where you can pay using EcoCash, OneMoney,
            Telecash, ZIPIT, or card.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MockPayment;
