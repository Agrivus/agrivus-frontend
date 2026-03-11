import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Button, LoadingSpinner } from "../components/common";
import paymentService, { type PaymentStatus, PAYMENT_METHODS } from "../services/paymentService";

type Stage =
  | "loading"       // fetching payment details
  | "instructions"  // show instructions + waiting for user action
  | "polling"       // actively polling for completion
  | "success"
  | "failed"
  | "cancelled";

const PaynowPayment: React.FC = () => {
  const { paymentId }        = useParams<{ paymentId: string }>();
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();

  const [stage, setStage]     = useState<Stage>("loading");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [error, setError]     = useState("");
  const [pollCount, setPollCount] = useState(0);

  // ── Load initial payment details ─────────────────────────────────────────

  useEffect(() => {
    // Handle Paynow callback redirect: /payment/return?ref=WD-1234-ABCD
    if (paymentId === "return") {
      const ref = searchParams.get("ref");
      if (!ref) {
        setError("Invalid return from payment gateway. Missing payment reference.");
        setStage("failed");
        return;
      }
      loadPayment(ref);
      return;
    }

    if (!paymentId) { navigate("/wallet"); return; }
    if (paymentId === "history") {
      navigate("/payment/history", { replace: true });
      return;
    }
    loadPayment(paymentId);
  }, [paymentId, searchParams, navigate]);

  const loadPayment = async (targetPaymentId?: string) => {
    try {
      const idToLoad = targetPaymentId || paymentId;
      if (!idToLoad) {
        setError("No payment ID provided.");
        setStage("failed");
        return;
      }

      const res = await paymentService.checkStatus(idToLoad);
      setPayment(res.data);

      if (res.data.status === "completed") { setStage("success"); return; }
      if (res.data.status === "failed")    { setStage("failed");  return; }
      if (res.data.status === "cancelled") { setStage("cancelled"); return; }

      // If there is a paymentUrl (ZimSwitch / internet banking), redirect to Paynow
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
        return;
      }

      // Mobile money — show instructions then start polling
      setStage("instructions");
    } catch (err) {
      setError("Failed to load payment details. Please open payment history and check this transaction.");
      setStage("failed");
    }
  };

  // ── Return URL handling (Paynow redirects back here after card payment) ──

  useEffect(() => {
    // Only trigger if we're not in the "return" route (already handled above)
    if (paymentId === "return") return;

    const ref    = searchParams.get("ref");
    const status = searchParams.get("payment");
    if (status === "success" && ref) {
      setStage("polling");   // Confirm via polling even after redirect
    }
  }, [searchParams, paymentId]);

  // ── Auto-poll when redirected from Paynow callback ──────────────────────────

  useEffect(() => {
    // If we loaded payment from a Paynow callback (/payment/return?ref=...),
    // auto-start polling when payment details are ready
    if (paymentId === "return" && stage === "instructions" && payment) {
      startPolling(payment.reference);
    }
  }, [paymentId, stage, payment]);

  // ── Polling ───────────────────────────────────────────────────────────────

  const startPolling = useCallback((targetPaymentId?: string) => {
    const idToUse = targetPaymentId || paymentId;
    if (!idToUse) {
      setError("No payment ID to poll.");
      setStage("failed");
      return;
    }

    setStage("polling");
    paymentService
      .pollPaymentStatus(
        idToUse,
        (status) => {
          setPayment(status);
          setPollCount((c) => c + 1);
        },
        72,  // 72 × 5s = 6 minutes
      )
      .then(() => setStage("success"))
      .catch((err: Error) => {
        if (err.message.includes("timeout")) {
          setError("Payment is taking longer than expected. Check your payment history for updates.");
        } else {
          setError(err.message);
        }
        setStage("failed");
      });
  }, [paymentId]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const methodInfo = PAYMENT_METHODS.find(
    (m) => m.id === payment?.paymentMethod,
  );

  const isCash    = payment?.paymentMethod === "cash";
  const isMock    = (payment as any)?.isMockPayment;

  // ── Render: loading ───────────────────────────────────────────────────────

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ── Render: cash deposit (no polling needed) ──────────────────────────────

  if (isCash) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">💵</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cash Deposit Submitted</h2>
          <p className="text-gray-600 mb-6">
            Your deposit of <strong>${payment?.amount?.toFixed(2)}</strong> is pending admin verification.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">What happens next:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>An admin will verify your cash deposit</li>
              <li>You'll receive a notification once verified</li>
              <li>Funds will appear in your wallet immediately after</li>
            </ol>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Reference: <span className="font-mono">{payment?.reference}</span>
          </p>
          <Button variant="primary" className="w-full" onClick={() => navigate("/wallet")}>
            Return to Wallet
          </Button>
        </Card>
      </div>
    );
  }

  // ── Render: success ───────────────────────────────────────────────────────

  if (stage === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            <strong>${payment?.amount?.toFixed(2)}</strong> has been added to your wallet.
          </p>
          <p className="text-xs text-gray-500 mb-8">
            Reference: <span className="font-mono">{payment?.reference}</span>
          </p>
          <Button variant="primary" className="w-full" onClick={() => navigate("/wallet")}>
            Go to Wallet
          </Button>
        </Card>
      </div>
    );
  }

  // ── Render: failed / cancelled ────────────────────────────────────────────

  if (stage === "failed" || stage === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">{stage === "cancelled" ? "❌" : "⚠️"}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {stage === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Your payment could not be processed."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/wallet")}>
              Back to Wallet
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate("/wallet?action=deposit")}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Render: polling ───────────────────────────────────────────────────────

  if (stage === "polling") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirming Payment…</h2>
          <p className="text-gray-600 mb-6">
            {isMock
              ? "Simulating payment confirmation…"
              : "Waiting for confirmation from your mobile wallet."}
          </p>
          {isMock && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                🔧 <strong>Mock mode</strong> — payment will auto-confirm in a few seconds
              </p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            Checked {pollCount} time{pollCount !== 1 ? "s" : ""}…
          </div>
        </Card>
      </div>
    );
  }

  // ── Render: instructions (mobile money) ───────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{methodInfo?.icon ?? "💳"}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {methodInfo?.label ?? "Complete Payment"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Follow the steps below to complete your payment
          </p>
        </div>

        {/* Amount */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <span className="text-2xl font-bold text-green-600">
              ${payment?.amount?.toFixed(2)} USD
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 text-sm">Reference</span>
            <span className="font-mono text-sm text-gray-800">{payment?.reference}</span>
          </div>
        </div>

        {/* Instructions */}
        {payment?.instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              {methodInfo?.requiresPhone
                ? "A payment prompt has been sent to your phone. If you didn't receive it, follow these steps:"
                : "Instructions:"}
            </p>
            <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
              {payment.instructions}
            </pre>
          </div>
        )}

        {/* Mock mode notice */}
        {isMock && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-amber-800">
              🔧 <strong>Development mode:</strong> Click "I've Paid" to simulate a completed payment
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => startPolling()}
          >
            I've Paid — Check Status
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/wallet")}
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Status will update automatically once your payment is confirmed
        </p>
      </Card>
    </div>
  );
};

export default PaynowPayment;
