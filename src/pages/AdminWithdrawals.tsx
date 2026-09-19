import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, LoadingSpinner } from "../components/common";
import api from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: string;
  withdrawal_method: string;
  account_details: string;
  status: "pending" | "processing" | "completed" | "rejected";
  payment_reference: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_role: string;
  processed_by_name: string | null;
  wallet_balance: string;
  wallet_escrow: string;
}

interface Summary {
  pending: { count: number; total: number };
  processing: { count: number; total: number };
  completed: { count: number; total: number };
  rejected: { count: number; total: number };
}

type StatusFilter = "all" | "pending" | "processing" | "completed" | "rejected";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

// ─────────────────────────────────────────────────────────────────────────────

const AdminWithdrawals: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [actioning, setActioning] = useState<string | null>(null); // request id being acted on
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Complete modal
  const [completeTarget, setCompleteTarget] =
    useState<WithdrawalRequest | null>(null);
  const [paymentReference, setPaymentReference] = useState("");

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const flash = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 6000);
    } else {
      setNotice(msg);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter === "all" ? {} : { status: filter };
      const res = await api.get("/admin/withdrawals", { params });
      if (res.data.success) {
        setRequests(res.data.data.requests);
        setSummary(res.data.data.summary);
      }
    } catch (err: any) {
      flash(
        err.response?.data?.message ?? "Failed to load withdrawal requests",
        true,
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markProcessing = async (req: WithdrawalRequest) => {
    try {
      setActioning(req.id);
      const res = await api.post(`/admin/withdrawals/${req.id}/processing`, {});
      if (res.data.success) {
        flash(
          `Marked $${parseFloat(req.amount).toFixed(2)} for ${req.user_name} as processing`,
        );
        await load();
      }
    } catch (err: any) {
      flash(err.response?.data?.message ?? "Failed to update request", true);
    } finally {
      setActioning(null);
    }
  };

  const submitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTarget) return;
    try {
      setActioning(completeTarget.id);
      const res = await api.post(
        `/admin/withdrawals/${completeTarget.id}/complete`,
        {
          paymentReference: paymentReference.trim(),
        },
      );
      if (res.data.success) {
        flash(
          `Withdrawal of $${parseFloat(completeTarget.amount).toFixed(2)} marked as paid`,
        );
        setCompleteTarget(null);
        setPaymentReference("");
        await load();
      }
    } catch (err: any) {
      flash(
        err.response?.data?.message ?? "Failed to complete withdrawal",
        true,
      );
    } finally {
      setActioning(null);
    }
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    try {
      setActioning(rejectTarget.id);
      const res = await api.post(
        `/admin/withdrawals/${rejectTarget.id}/reject`,
        {
          rejectionReason: rejectionReason.trim(),
        },
      );
      if (res.data.success) {
        flash(
          `Withdrawal rejected — funds returned to ${rejectTarget.user_name}`,
        );
        setRejectTarget(null);
        setRejectionReason("");
        await load();
      }
    } catch (err: any) {
      flash(err.response?.data?.message ?? "Failed to reject withdrawal", true);
    } finally {
      setActioning(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Flash messages */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm">
          {error}
        </div>
      )}
      {notice && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm">
          {notice}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Withdrawal Requests
        </h1>
        <p className="text-gray-600 mt-2">
          Process farmer withdrawals — send the money, then record the payment
          reference here
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(["pending", "processing", "completed", "rejected"] as const).map(
            (s) => (
              <Card key={s} className="p-4 text-center">
                <p
                  className={`text-2xl font-bold ${
                    s === "pending"
                      ? "text-amber-600"
                      : s === "processing"
                        ? "text-blue-600"
                        : s === "completed"
                          ? "text-green-700"
                          : "text-red-600"
                  }`}
                >
                  {summary[s].count}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                  {s}
                </p>
                <p className="text-sm text-gray-700 font-medium mt-1">
                  ${summary[s].total.toLocaleString()}
                </p>
              </Card>
            ),
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === t.key
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
            {summary && t.key !== "all" && summary[t.key].count > 0 && (
              <span className="ml-1.5 opacity-75">
                ({summary[t.key].count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <p className="text-lg">
            No {filter === "all" ? "" : filter} withdrawal requests
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Left: who + what */}
                <div className="flex-1 min-w-[260px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-2xl font-bold text-gray-900">
                      ${parseFloat(req.amount).toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${STATUS_BADGE[req.status]}`}
                    >
                      {req.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      via {req.withdrawal_method}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">{req.user_name}</span>
                    <span className="text-gray-400"> · </span>
                    <span>{req.user_email}</span>
                    {req.user_phone && (
                      <>
                        <span className="text-gray-400"> · </span>
                        <span>{req.user_phone}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-1 text-sm">
                    <span className="text-gray-500">Send to: </span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {req.account_details}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Requested {new Date(req.created_at).toLocaleString()}
                    {" · "}Wallet balance: $
                    {parseFloat(req.wallet_balance).toLocaleString()}
                    {" · "}In escrow: $
                    {parseFloat(req.wallet_escrow).toLocaleString()}
                  </div>

                  {req.payment_reference && (
                    <div className="mt-2 text-xs text-green-700">
                      Paid — reference:{" "}
                      <span className="font-mono bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                        {req.payment_reference}
                      </span>
                      {req.processed_by_name &&
                        ` · by ${req.processed_by_name}`}
                    </div>
                  )}
                  {req.rejection_reason && (
                    <div className="mt-2 text-xs text-red-700">
                      Rejected: {req.rejection_reason}
                      {req.processed_by_name &&
                        ` · by ${req.processed_by_name}`}
                    </div>
                  )}
                </div>

                {/* Right: actions */}
                {(req.status === "pending" || req.status === "processing") && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {req.status === "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => markProcessing(req)}
                        disabled={actioning === req.id}
                      >
                        🔄 Mark Processing
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setCompleteTarget(req);
                        setPaymentReference("");
                      }}
                      disabled={actioning === req.id}
                    >
                      ✅ Mark Paid
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectTarget(req);
                        setRejectionReason("");
                      }}
                      disabled={actioning === req.id}
                      className="!border-red-300 !text-red-600 hover:!bg-red-50"
                    >
                      ❌ Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Complete modal ──────────────────────────────────────────────────── */}
      {completeTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Mark as Paid
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ${parseFloat(completeTarget.amount).toLocaleString()} to{" "}
              <span className="font-semibold">{completeTarget.user_name}</span>{" "}
              via {completeTarget.withdrawal_method} —{" "}
              <span className="font-mono">
                {completeTarget.account_details}
              </span>
            </p>
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                Only do this AFTER the money has actually been sent. This
                deducts the farmer's balance and cannot be undone.
              </p>
            </div>
            <form onSubmit={submitComplete}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference *
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="EcoCash / bank transaction ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                required
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    !paymentReference.trim() || actioning === completeTarget.id
                  }
                >
                  {actioning === completeTarget.id ? "Saving…" : "Confirm Paid"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCompleteTarget(null);
                    setPaymentReference("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Reject modal ────────────────────────────────────────────────────── */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Reject Withdrawal
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ${parseFloat(rejectTarget.amount).toLocaleString()} from{" "}
              <span className="font-semibold">{rejectTarget.user_name}</span> —
              the funds will be returned to their wallet automatically.
            </p>
            <form onSubmit={submitReject}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *{" "}
                <span className="text-gray-400 font-normal">
                  (the farmer will see this)
                </span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Account details do not match the registered name"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4 resize-none"
                required
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 !bg-red-600 hover:!bg-red-700"
                  disabled={
                    !rejectionReason.trim() || actioning === rejectTarget.id
                  }
                >
                  {actioning === rejectTarget.id
                    ? "Rejecting…"
                    : "Reject & Refund"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setRejectTarget(null);
                    setRejectionReason("");
                  }}
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

export default AdminWithdrawals;
