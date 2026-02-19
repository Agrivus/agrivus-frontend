import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, LoadingSpinner } from "../components/common";
import {
  getModeratorDashboard,
  verifyUserProfile,
  resolveDispute,
} from "../services/adminService";

interface ModeratorSummary {
  disputedOrders: number;
  flaggedListings: number;
  pendingVerifications: number;
  activeUsers24h: number;
}

interface ModeratorStats {
  summary: ModeratorSummary;
  recentNewUsers: any[];
  recentDisputes: any[];
}

type DisputeOutcome =
  | "favour_buyer"
  | "favour_farmer"
  | "split"
  | "escalate_to_admin"
  | "";

const OUTCOME_LABELS: Record<string, string> = {
  favour_buyer: "In favour of Buyer",
  favour_farmer: "In favour of Farmer",
  split: "Split (Equal)",
  escalate_to_admin: "Escalate to Admin",
};

const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dispute resolution state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<DisputeOutcome>("");
  const [notes, setNotes] = useState("");
  const [resolveError, setResolveError] = useState("");
  const [resolveSuccess, setResolveSuccess] = useState("");
  const [resolveLoading, setResolveLoading] = useState(false);

  // Verification state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const isStaff =
    user?.role === "admin" || user?.role === "support_moderator";
  const isAdmin = user?.role === "admin";

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getModeratorDashboard();
      setStats(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load moderator dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isStaff) {
      navigate("/dashboard");
      return;
    }
    fetchStats();
  }, [isStaff, navigate, fetchStats]);

  const handleResolveDispute = async (orderId: string) => {
    setResolveError("");
    setResolveSuccess("");

    if (!outcome) {
      setResolveError("Please select an outcome.");
      return;
    }
    if (!notes.trim()) {
      setResolveError("Please provide resolution notes.");
      return;
    }

    setResolveLoading(true);
    try {
      await resolveDispute(
        orderId,
        outcome as Exclude<DisputeOutcome, "">,
        notes
      );
      const label = OUTCOME_LABELS[outcome] || outcome;
      setResolveSuccess(
        `Dispute for order #${orderId.substring(0, 8)} resolved: ${label}.`
      );
      setResolvingId(null);
      setOutcome("");
      setNotes("");
      fetchStats();
    } catch (err: any) {
      setResolveError(
        err.response?.data?.message || "Failed to resolve dispute"
      );
    } finally {
      setResolveLoading(false);
    }
  };

  const handleVerify = async (userId: string, verified: boolean) => {
    setVerifyingId(userId);
    try {
      await verifyUserProfile(
        userId,
        verified,
        verified
          ? "Verified by support moderator"
          : "Verification revoked by moderator"
      );
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification action failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const openResolve = (orderId: string) => {
    if (resolvingId === orderId) {
      setResolvingId(null);
      setOutcome("");
      setNotes("");
      setResolveError("");
    } else {
      setResolvingId(orderId);
      setOutcome("");
      setNotes("");
      setResolveError("");
    }
  };

  if (!isStaff) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-2">
        <div>
          <h1 className="text-3xl font-bold text-primary-green flex items-center gap-2">
            {isAdmin ? "🛡️ Admin" : "🔍 Moderator"} Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Logged in as{" "}
            <span className="font-semibold text-gray-700">{user?.fullName}</span>
            {" · "}
            <span className="capitalize bg-light-green text-primary-green text-xs px-2 py-0.5 rounded">
              {user?.role?.replace("_", " ")}
            </span>
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {new Date().toLocaleString()}
        </div>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {resolveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
          ✅ {resolveSuccess}
        </div>
      )}

      {stats && (
        <>
          {/* ── Summary Cards ───────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Platform At a Glance
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Disputed Orders</p>
                    <p className="text-3xl font-bold">
                      {stats.summary.disputedOrders}
                    </p>
                    <p className="text-xs opacity-60 mt-1">Needs attention</p>
                  </div>
                  <span className="text-4xl opacity-30">⚠️</span>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Flagged Listings</p>
                    <p className="text-3xl font-bold">
                      {stats.summary.flaggedListings}
                    </p>
                    <p className="text-xs opacity-60 mt-1">Under review</p>
                  </div>
                  <span className="text-4xl opacity-30">🚩</span>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">
                      Pending Verifications
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.summary.pendingVerifications}
                    </p>
                    <p className="text-xs opacity-60 mt-1">Awaiting review</p>
                  </div>
                  <span className="text-4xl opacity-30">📋</span>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Active Users (24h)</p>
                    <p className="text-3xl font-bold">
                      {stats.summary.activeUsers24h}
                    </p>
                    <p className="text-xs opacity-60 mt-1">Currently active</p>
                  </div>
                  <span className="text-4xl opacity-30">👥</span>
                </div>
              </Card>
            </div>
          </section>

          {/* ── Quick Actions ────────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ActionCard
                icon="👥"
                title="Browse Users"
                description="View profiles, activity & verify"
                onClick={() => navigate("/admin/users")}
              />
              <ActionCard
                icon="📦"
                title="View Orders"
                description="Monitor & mediate orders"
                onClick={() => navigate("/admin/orders")}
              />
              <ActionCard
                icon="💳"
                title="Transactions"
                description="Read-only audit view"
                onClick={() => navigate("/admin/transactions")}
              />
              <ActionCard
                icon="📝"
                title="My Activity Log"
                description="Actions I've taken"
                onClick={() => navigate("/moderator/activity-log")}
                highlight
              />

              {/* Admin-only actions */}
              {isAdmin && (
                <>
                  <ActionCard
                    icon="💵"
                    title="Cash Deposits"
                    description="Approve pending deposits"
                    onClick={() => navigate("/admin/cash-deposits")}
                  />
                  <ActionCard
                    icon="🔒"
                    title="Security"
                    description="Incidents & system health"
                    onClick={() => navigate("/admin/security")}
                  />
                  <ActionCard
                    icon="📊"
                    title="Reports"
                    description="Export & analytics data"
                    onClick={() => navigate("/admin/reports")}
                  />
                  <ActionCard
                    icon="🌍"
                    title="Export Gateway"
                    description="Monitor export activities"
                    onClick={() => navigate("/export")}
                  />
                </>
              )}
            </div>
          </section>

          {/* ── Open Disputes ────────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              🔴 Open Disputes
              {stats.summary.disputedOrders > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.summary.disputedOrders}
                </span>
              )}
            </h2>
            <Card>
              {stats.recentDisputes.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">
                  ✅ No open disputes — great work!
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.recentDisputes.map((dispute: any) => (
                    <div
                      key={dispute.id}
                      className="p-4 border border-red-100 bg-red-50 rounded-lg"
                    >
                      {/* Dispute header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">
                            Order #{dispute.id.substring(0, 8)}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {dispute.crop_type || "N/A"} &bull; $
                            {parseFloat(dispute.total_amount || 0).toFixed(2)}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                            <span>🌾 {dispute.farmer_name}</span>
                            <span>🛒 {dispute.buyer_name}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            📍 {dispute.delivery_location || "—"}
                          </p>
                        </div>
                        <button
                          onClick={() => openResolve(dispute.id)}
                          className={`ml-4 shrink-0 text-xs px-3 py-1.5 rounded font-semibold transition-colors ${
                            resolvingId === dispute.id
                              ? "bg-gray-400 text-white hover:bg-gray-500"
                              : "bg-primary-green text-white hover:bg-green-700"
                          }`}
                        >
                          {resolvingId === dispute.id ? "Cancel" : "Resolve"}
                        </button>
                      </div>

                      {/* Inline resolution form */}
                      {resolvingId === dispute.id && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Resolution Decision
                          </p>

                          {resolveError && (
                            <p className="text-red-600 text-xs mb-2 bg-red-50 px-2 py-1 rounded">
                              {resolveError}
                            </p>
                          )}

                          <select
                            value={outcome}
                            onChange={(e) =>
                              setOutcome(e.target.value as DisputeOutcome)
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
                            disabled={resolveLoading}
                          >
                            <option value="">— Select outcome —</option>
                            {Object.entries(OUTCOME_LABELS).map(
                              ([val, label]) => (
                                <option key={val} value={val}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>

                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Resolution notes (required)…"
                            rows={3}
                            disabled={resolveLoading}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary-green resize-none"
                          />

                          {outcome === "escalate_to_admin" && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded mb-2">
                              ⬆️ This dispute will remain open and flagged for
                              admin financial action.
                            </p>
                          )}

                          {outcome && outcome !== "escalate_to_admin" && (
                            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1.5 rounded mb-2">
                              ℹ️ Order status will be set to "resolved". An
                              admin must complete the financial settlement.
                            </p>
                          )}

                          <button
                            onClick={() => handleResolveDispute(dispute.id)}
                            disabled={resolveLoading}
                            className="w-full bg-primary-green text-white py-2 rounded text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resolveLoading
                              ? "Submitting…"
                              : "Submit Resolution"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* ── New Users — Verification Queue ───────────────────── */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              🆕 New Users (Last 48h)
              <span className="text-xs text-gray-400 font-normal">
                — Verification Queue
              </span>
            </h2>
            <Card>
              {stats.recentNewUsers.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">
                  No new users in the last 48 hours
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-200">
                        <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Name
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">
                          Email
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Role
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Verified
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">
                          Joined
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentNewUsers.map((u: any) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {u.full_name}
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {u.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize bg-light-green text-primary-green text-xs px-2 py-0.5 rounded">
                              {u.role?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_verified ? (
                              <span className="text-green-600 font-semibold text-xs">
                                ✅ Yes
                              </span>
                            ) : (
                              <span className="text-red-500 font-semibold text-xs">
                                ❌ No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                            {new Date(u.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {verifyingId === u.id ? (
                              <span className="text-xs text-gray-400">
                                Saving…
                              </span>
                            ) : !u.is_verified ? (
                              <button
                                onClick={() => handleVerify(u.id, true)}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                              >
                                Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(u.id, false)}
                                className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                              >
                                Unverify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
};

// ── Reusable action card component ──────────────────────────────────────────

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  onClick,
  highlight,
}) => (
  <button
    onClick={onClick}
    className={`p-5 bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 text-left w-full ${
      highlight
        ? "border-blue-300 hover:border-blue-500"
        : "border-transparent hover:border-primary-green"
    }`}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
  </button>
);

export default ModeratorDashboard;