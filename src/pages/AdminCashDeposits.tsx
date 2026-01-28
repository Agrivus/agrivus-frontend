import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";

interface CashDeposit {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  amount: string;
  currency: string;
  reference: string;
  status: string;
  created_at: string;
  gateway_transaction_id: string;
}

export default function AdminCashDeposits() {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<CashDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadDeposits();
  }, [pagination.page]);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingCashDeposits(
        pagination.page,
        pagination.limit,
      );

      if (response.success) {
        setDeposits(response.data.deposits);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    try {
      setApproving(paymentId);
      const response = await adminService.approveCashDeposit(paymentId, {
        approvalNotes: "Verified by admin",
      });

      if (response.success) {
        setDeposits((prev) => prev.filter((d) => d.id !== paymentId));
        alert("✅ Deposit approved successfully!");
      }
    } catch (error) {
      console.error("Failed to approve deposit:", error);
      alert("Failed to approve deposit");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setRejecting(paymentId);
      const response = await adminService.rejectCashDeposit(paymentId, {
        rejectionReason: rejectionReason,
      });

      if (response.success) {
        setDeposits((prev) => prev.filter((d) => d.id !== paymentId));
        setRejectionReason("");
        setSelectedDeposit(null);
        alert("❌ Deposit rejected successfully!");
      }
    } catch (error) {
      console.error("Failed to reject deposit:", error);
      alert("Failed to reject deposit");
    } finally {
      setRejecting(null);
    }
  };

  if (loading && deposits.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💵 Cash Deposit Verification
          </h1>
          <p className="text-gray-600">
            Review and approve pending cash deposits from users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2">Pending Deposits</p>
              <p className="text-3xl font-bold text-blue-600">
                {pagination.total}
              </p>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2">Total Amount Pending</p>
              <p className="text-3xl font-bold text-green-600">
                $
                {deposits
                  .reduce((sum, d) => sum + parseFloat(d.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2">Showing Page</p>
              <p className="text-3xl font-bold text-indigo-600">
                {pagination.page} of {pagination.totalPages}
              </p>
            </div>
          </Card>
        </div>

        {/* Deposits List */}
        {deposits.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <p className="text-gray-500 text-lg">
              🎉 No pending cash deposits! All verified.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deposits.map((deposit) => (
              <Card
                key={deposit.id}
                className="bg-white hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* User Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">User</p>
                      <p className="font-semibold text-gray-900">
                        {deposit.full_name}
                      </p>
                      <p className="text-sm text-gray-500">{deposit.email}</p>
                      <p className="text-sm text-gray-500">{deposit.phone}</p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(deposit.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {deposit.currency}
                      </p>
                    </div>

                    {/* Reference */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reference</p>
                      <p className="font-mono text-sm break-all">
                        {deposit.reference}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(deposit.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 flex gap-3">
                    {selectedDeposit === deposit.id ? (
                      // Rejection form
                      <div className="flex-1">
                        <div className="space-y-3">
                          <textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(deposit.id)}
                              disabled={rejecting === deposit.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {rejecting === deposit.id
                                ? "Rejecting..."
                                : "Confirm Rejection"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDeposit(null);
                                setRejectionReason("");
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(deposit.id)}
                          disabled={approving === deposit.id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                        >
                          {approving === deposit.id
                            ? "Approving..."
                            : "✅ Approve Deposit"}
                        </button>
                        <button
                          onClick={() => setSelectedDeposit(deposit.id)}
                          className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPagination((p) => ({ ...p, page: i + 1 }))}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pagination.page === i + 1
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.totalPages, p.page + 1),
                }))
              }
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
