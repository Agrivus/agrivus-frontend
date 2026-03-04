import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Button, LoadingSpinner } from "../components/common";
import { walletService } from "../services/walletService";
import paymentService, {
  PAYMENT_METHODS,
  type SupportedPaymentMethod,
} from "../services/paymentService";
import type { WalletBalance, Transaction } from "../services/walletService";
import { getWalletErrorMessage, getErrorMessage } from "../utils/errorHandler";

// ── Tiny inline toast (no extra dependency) ───────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; message: string; type: ToastType }

// ── Helpers ───────────────────────────────────────────────────────────────────
const TX_ICONS: Record<string, string> = {
  deposit:        "💰",
  payment:        "💵",
  escrow_hold:    "🔒",
  escrow_release: "🔓",
  withdrawal:     "💸",
  transport_fee:  "🚛",
};

const TX_COLORS: Record<string, string> = {
  deposit:        "bg-green-100 text-green-600",
  payment:        "bg-blue-100 text-blue-600",
  escrow_hold:    "bg-yellow-100 text-yellow-600",
  escrow_release: "bg-purple-100 text-purple-600",
  withdrawal:     "bg-red-100 text-red-600",
  transport_fee:  "bg-orange-100 text-orange-600",
};

const isCredit = (type: string) =>
  type === "deposit" || type === "payment" || type === "transport_fee";

// ─────────────────────────────────────────────────────────────────────────────

const Wallet: React.FC = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const [balance, setBalance]           = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [toastId, setToastId]           = useState(0);

  // Modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount]       = useState("");
  const [selectedMethod, setSelectedMethod]     = useState<SupportedPaymentMethod>("ecocash");
  const [processing, setProcessing]             = useState(false);

  // Instructions panel (for ZimSwitch / bank transfer — no redirect)
  const [manualInstructions, setManualInstructions] = useState<{
    reference: string;
    instructions: string;
    amount: number;
    method: string;
  } | null>(null);

  // Available methods only
  const availableMethods = PAYMENT_METHODS.filter((m) => m.available);

  // ── Toast helpers ───────────────────────────────────────────────────────────

  const addToast = (message: string, type: ToastType = "success") => {
    const id = toastId + 1;
    setToastId(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  // ── Load wallet data ────────────────────────────────────────────────────────

  useEffect(() => {
    loadWalletData();

    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      addToast("Payment completed successfully!", "success");
      setTimeout(() => loadWalletData(), 1500);
    } else if (paymentStatus === "pending") {
      addToast("Cash deposit submitted. You'll be notified once verified.", "info");
      setTimeout(() => loadWalletData(), 1500);
    } else if (paymentStatus === "failed") {
      addToast("Payment failed. Please try again.", "error");
    } else if (paymentStatus === "cancelled") {
      addToast("Payment was cancelled.", "warning");
    }

    // Auto-open deposit modal if redirected with ?action=deposit
    if (searchParams.get("action") === "deposit") {
      setShowDepositModal(true);
    }
  }, [searchParams]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, txData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(txData.transactions);
    } catch (error) {
      addToast(getErrorMessage(error, "Failed to load wallet data"), "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle deposit ──────────────────────────────────────────────────────────

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1)     { addToast("Minimum deposit is $1", "error"); return; }
    if (amount > 10000)            { addToast("Maximum deposit is $10,000", "error"); return; }
    if (!selectedMethod)           { addToast("Please select a payment method", "error"); return; }

    try {
      setProcessing(true);

      const response = await paymentService.initiateDeposit({
        amount,
        paymentMethod: selectedMethod,
      });

      if (!response.success) {
        addToast(response.message ?? "Failed to initiate payment", "error");
        return;
      }

      const { paymentUrl, paymentId, instructions, reference } = response.data;

      setShowDepositModal(false);
      setDepositAmount("");

      if (paymentUrl) {
        // Paynow redirect (EcoCash prompt sent / ZimSwitch page)
        // For mock payments this goes to /payment/mock/:id
        // For real Paynow this goes to paynow.co.zw
        window.location.href = paymentUrl;
      } else if (instructions) {
        // Manual methods (bank transfer etc.) — show inline instructions
        setManualInstructions({ reference, instructions, amount, method: selectedMethod });
      } else if (paymentId) {
        // Cash deposit — navigate to confirmation page
        navigate(`/payment/${paymentId}`);
      }
    } catch (error: any) {
      addToast(getWalletErrorMessage(error), "error");
    } finally {
      setProcessing(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm transition-all ${
              t.type === "success" ? "bg-green-600 text-white" :
              t.type === "error"   ? "bg-red-600 text-white"   :
              t.type === "warning" ? "bg-amber-500 text-white" :
                                     "bg-blue-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your funds and view transaction history</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6">
          <h3 className="text-lg font-semibold mb-2 opacity-90">Total Balance</h3>
          <p className="text-4xl font-bold">${balance?.balance.toLocaleString()}</p>
          <p className="text-sm mt-2 opacity-75">{balance?.currency}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6">
          <h3 className="text-lg font-semibold mb-2 opacity-90">In Escrow</h3>
          <p className="text-4xl font-bold">${balance?.escrowBalance.toLocaleString()}</p>
          <p className="text-sm mt-2 opacity-75">Held in active orders</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6">
          <h3 className="text-lg font-semibold mb-2 opacity-90">Available</h3>
          <p className="text-4xl font-bold">${balance?.availableBalance.toLocaleString()}</p>
          <p className="text-sm mt-2 opacity-75">Ready to spend</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => setShowDepositModal(true)}>
          <span className="mr-2">💰</span>Deposit Funds
        </Button>
        <Button variant="outline" onClick={() => navigate("/payment/history")}>
          <span className="mr-2">📜</span>Payment History
        </Button>
      </div>

      {/* Locked wallet warning */}
      {balance?.isLocked && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h3 className="font-bold text-red-900">Wallet Locked</h3>
            <p className="text-red-700 text-sm mt-1">
              Your wallet has been locked. Please contact support.
            </p>
          </div>
        </div>
      )}

      {/* Manual payment instructions (ZimSwitch / bank transfer) */}
      {manualInstructions && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-blue-900">Payment Instructions</h3>
            <button
              onClick={() => setManualInstructions(null)}
              className="text-blue-500 hover:text-blue-700 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="mb-3">
            <span className="text-sm text-blue-700 font-medium">Amount: </span>
            <span className="text-sm text-blue-900 font-bold">${manualInstructions.amount.toFixed(2)} USD</span>
          </div>
          <div className="mb-4">
            <span className="text-sm text-blue-700 font-medium">Reference: </span>
            <span className="font-mono text-sm text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              {manualInstructions.reference}
            </span>
          </div>
          <pre className="text-sm text-blue-800 whitespace-pre-wrap bg-blue-100 rounded-lg p-4 font-sans">
            {manualInstructions.instructions}
          </pre>
          <p className="text-xs text-blue-700 mt-3">
            Your wallet will be credited automatically once your payment is confirmed (typically within 1–3 hours).
          </p>
        </div>
      )}

      {/* Transaction history */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-600 mt-1">All wallet transactions</p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">Deposit funds to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${TX_COLORS[tx.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {TX_ICONS[tx.type] ?? "💳"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()} at{" "}
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isCredit(tx.type) ? "text-green-600" : tx.type === "withdrawal" ? "text-red-600" : "text-gray-900"}`}>
                    {isCredit(tx.type) ? "+" : tx.type === "withdrawal" ? "−" : ""}
                    ${parseFloat(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Balance: ${parseFloat(tx.balanceAfter).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Deposit Modal ───────────────────────────────────────────────────── */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Deposit Funds</h3>
              <button
                onClick={() => { setShowDepositModal(false); setDepositAmount(""); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={processing}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit}>

              {/* Amount */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Enter amount"
                  required
                  disabled={processing}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: $1 · Maximum: $10,000</p>
              </div>

              {/* Payment method selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {availableMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      disabled={processing}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition ${
                        selectedMethod === method.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${selectedMethod === method.id ? "text-green-900" : "text-gray-900"}`}>
                          {method.label}
                        </p>
                        <p className="text-xs text-gray-500">{method.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === method.id ? "border-green-500 bg-green-500" : "border-gray-300"
                      }`}>
                        {selectedMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Context hint for selected method */}
              {selectedMethod && (() => {
                const m = PAYMENT_METHODS.find((x) => x.id === selectedMethod);
                if (!m) return null;
                if (m.id === "cash") {
                  return (
                    <div className="mb-5 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">How cash deposits work:</p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Hand cash to an authorized Agrivus representative</li>
                        <li>Submit this form — your deposit goes to admin verification</li>
                        <li>Funds appear in your wallet once verified</li>
                      </ol>
                    </div>
                  );
                }
                if (m.requiresPhone) {
                  return (
                    <div className="mb-5 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        📱 A payment prompt will be sent to the phone number on your account.
                        Make sure your {m.label} wallet has sufficient balance.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="mb-5 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      🏦 You'll receive bank transfer instructions after confirming.
                    </p>
                  </div>
                );
              })()}

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={processing || !depositAmount || parseFloat(depositAmount) < 1}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing…
                    </span>
                  ) : (
                    `Deposit $${parseFloat(depositAmount || "0").toFixed(2)}`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowDepositModal(false); setDepositAmount(""); }}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Wallet;