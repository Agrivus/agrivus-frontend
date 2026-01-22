import React, { useState, useEffect } from "react";
import { Layout, Card, LoadingSpinner } from "../components/common";
import paymentService, {
  type PaymentHistoryItem,
} from "../services/paymentService";

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadPaymentHistory();
  }, [filter]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getHistory({
        page: 1,
        limit: 50,
        status: filter === "all" ? undefined : filter,
      });
      setPayments(response.data.payments);
    } catch (error) {
      console.error("Failed to load payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        completed: {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "✓ Completed",
        },
        pending: {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "⏳ Pending",
        },
        processing: {
          bg: "bg-blue-100",
          text: "text-blue-800",
          label: "🔄 Processing",
        },
        failed: { bg: "bg-red-100", text: "text-red-800", label: "✗ Failed" },
        cancelled: {
          bg: "bg-gray-100",
          text: "text-gray-800",
          label: "⊘ Cancelled",
        },
      };

    const badge = badges[status] || badges.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      ecocash: "💳",
      onemoney: "💳",
      telecash: "💳",
      zipit: "🏦",
      usd_bank: "🏦",
      card: "💳",
    };
    return icons[method] || "💰";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            View all your payment transactions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "pending"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("failed")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "failed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Failed
            </button>
          </div>
        </Card>

        {/* Payments List */}
        <Card>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No payment transactions found</p>
              <p className="text-sm mt-2">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {payment.type
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {payment.paymentMethod.toUpperCase()} Payment
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          Ref: {payment.reference}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                        {payment.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Completed:{" "}
                            {new Date(payment.completedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${parseFloat(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.currency}
                      </p>
                    </div>
                  </div>

                  {/* Instructions for manual payments */}
                  {payment.instructions && payment.status === "pending" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Payment Instructions:
                      </p>
                      <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
                        {payment.instructions}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentHistory;
