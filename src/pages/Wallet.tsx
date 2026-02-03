import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Button, LoadingSpinner } from "../components/common";
import { walletService } from "../services/walletService";
import paymentService from "../services/paymentService";
import type { WalletBalance, Transaction } from "../services/walletService";
import { getWalletErrorMessage, getErrorMessage } from "../utils/errorHandler";

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWalletData();

    // Check for payment success/failure from URL params
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      showNotification("✅ Payment completed successfully!", "success");
      // Reload wallet to show updated balance
      setTimeout(() => loadWalletData(), 1000);
    } else if (paymentStatus === "pending") {
      showNotification(
        "⏳ Your cash deposit has been submitted for verification. You will receive a notification once it's confirmed.",
        "success",
      );
      setTimeout(() => loadWalletData(), 1000);
    } else if (paymentStatus === "failed") {
      showNotification("❌ Payment failed. Please try again.", "error");
    } else if (paymentStatus === "cancelled") {
      showNotification("⚠️ Payment was cancelled.", "warning");
    }
  }, [searchParams]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
      showNotification(
        getErrorMessage(error, "Failed to load wallet data"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(depositAmount);

    // Validation
    if (!amount || amount <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    if (amount < 1) {
      showNotification("Minimum deposit amount is $1", "error");
      return;
    }

    if (amount > 10000) {
      showNotification(
        "Maximum deposit amount is $10,000 per transaction",
        "error",
      );
      return;
    }

    try {
      setProcessing(true);

      // Initiate payment via gateway
      const response = await paymentService.initiateDeposit({
        amount,
        paymentMethod: paymentMethod as any,
      });

      if (response.success) {
        const { paymentUrl, isMockPayment } = response.data;

        // Close modal
        setShowDepositModal(false);
        setDepositAmount("");

        if (isMockPayment && paymentUrl) {
          // Redirect to mock payment page
          window.location.href = paymentUrl;
        } else if (paymentUrl) {
          // Redirect to actual payment gateway (Paynow)
          window.location.href = paymentUrl;
        } else {
          // Manual payment (ZIPIT/Bank Transfer)
          showManualPaymentInstructions(response.data);
        }
      }
    } catch (error: any) {
      console.error("Deposit initiation failed:", error);
      showNotification(getWalletErrorMessage(error), "error");
    } finally {
      setProcessing(false);
    }
  };

  const showManualPaymentInstructions = (paymentData: any) => {
    // Show modal with payment instructions for manual methods
    alert(
      `Payment Instructions:\n\n${paymentData.instructions}\n\nReference: ${paymentData.reference}\n\nPlease complete the payment and it will be credited within 24 hours.`,
    );
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    // Simple alert for now - you can replace with a toast notification library
    if (type === "success") {
      alert(`✅ ${message}`);
    } else if (type === "error") {
      alert(`❌ ${message}`);
    } else {
      alert(`⚠️ ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-2">
          Manage your funds and view transaction history
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <h3 className="text-lg font-semibold mb-2 opacity-90">
            Total Balance
          </h3>
          <p className="text-4xl font-bold">
            ${balance?.balance.toLocaleString()}
          </p>
          <p className="text-sm mt-2 opacity-75">{balance?.currency}</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <h3 className="text-lg font-semibold mb-2 opacity-90">In Escrow</h3>
          <p className="text-4xl font-bold">
            ${balance?.escrowBalance.toLocaleString()}
          </p>
          <p className="text-sm mt-2 opacity-75">Funds held in orders</p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <h3 className="text-lg font-semibold mb-2 opacity-90">Available</h3>
          <p className="text-4xl font-bold">
            ${balance?.availableBalance.toLocaleString()}
          </p>
          <p className="text-sm mt-2 opacity-75">Ready to spend</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => setShowDepositModal(true)}>
          <span className="mr-2">💰</span> Deposit Funds
        </Button>
        <Button variant="outline" onClick={() => navigate("/payment/history")}>
          <span className="mr-2">📜</span> Payment History
        </Button>
      </div>

      {/* Locked Wallet Warning */}
      {balance?.isLocked && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔒</span>
            <div>
              <h3 className="font-bold text-red-900">Wallet Locked</h3>
              <p className="text-red-700 text-sm mt-1">
                Your wallet has been locked. Please contact support for
                assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h2>
          <p className="text-gray-600 mt-1">
            View all your wallet transactions
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">Deposit funds to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tx.type === "deposit"
                        ? "bg-green-100 text-green-600"
                        : tx.type === "payment"
                          ? "bg-blue-100 text-blue-600"
                          : tx.type === "escrow_hold"
                            ? "bg-yellow-100 text-yellow-600"
                            : tx.type === "escrow_release"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tx.type === "deposit" && "💰"}
                    {tx.type === "payment" && "💵"}
                    {tx.type === "escrow_hold" && "🔒"}
                    {tx.type === "escrow_release" && "🔓"}
                    {tx.type === "withdrawal" && "💸"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()} at{" "}
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      tx.type === "deposit" || tx.type === "payment"
                        ? "text-green-600"
                        : tx.type === "withdrawal"
                          ? "text-red-600"
                          : "text-gray-900"
                    }`}
                  >
                    {tx.type === "deposit" || tx.type === "payment"
                      ? "+"
                      : tx.type === "withdrawal"
                        ? "-"
                        : ""}
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Deposit Funds
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={processing}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit}>
              <div className="mb-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount (min $1, max $10,000)"
                  required
                  disabled={processing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: $1 | Maximum: $10,000 per transaction
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  💵 Cash Deposit
                </div>

                {/* Payment Method Info */}
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold mb-2">
                    How to Deposit via Cash:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>
                      Hand your cash to one of our authorized company
                      stakeholders
                    </li>
                    <li>Complete the deposit form below</li>
                    <li>
                      Your deposit will be marked as pending for admin
                      verification
                    </li>
                    <li>
                      Once verified, your funds will appear in your wallet
                    </li>
                  </ol>
                </div>
              </div>

              {/* Payment Methods Notice */}
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>📌 Please Note:</strong> At this time, cash deposits
                  are the only available option for funding your wallet.
                  Additional electronic payment methods will be introduced in a
                  future update
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    processing ||
                    !depositAmount ||
                    parseFloat(depositAmount) < 1
                  }
                >
                  {processing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    `Deposit $${depositAmount || "0"}`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDepositModal(false)}
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
