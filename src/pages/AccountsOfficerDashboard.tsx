import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTransactions,
  getPendingCashDeposits,
  getRevenueReport,
} from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

interface FinanceSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  pendingCashDeposits: number;
  totalOrderVolume: number;
  totalCommission: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

interface PendingDeposit {
  id: string;
  amount: string;
  reference: string;
  full_name: string;
  email: string;
  created_at: string;
}

const CREDIT_TYPES = new Set(["deposit", "refund", "escrow_release", "commission"]);

function isCredit(type: string): boolean {
  return CREDIT_TYPES.has(type.toLowerCase());
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

const AccountsOfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<FinanceSummary>({
    totalDeposits:       0,
    totalWithdrawals:    0,
    totalTransactions:   0,
    pendingCashDeposits: 0,
    totalOrderVolume:    0,
    totalCommission:     0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [pendingDeposits, setPendingDeposits]       = useState<PendingDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [txnRes, depositRes, revenueRes] = await Promise.allSettled([
        getAllTransactions({ page: 1, limit: 100 }),
        getPendingCashDeposits(1, 5),
        getRevenueReport(),
      ]);

      // ── Transactions ──────────────────────────────────────────────────────
      if (txnRes.status === "fulfilled" && txnRes.value.success) {
        const txns: RecentTransaction[] = txnRes.value.data.transactions || [];
        const total = txnRes.value.data.pagination?.total ?? txns.length;

        const depositTotal = txns
          .filter((t) => t.type === "deposit")
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const withdrawalTotal = txns
          .filter((t) => t.type === "withdrawal")
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        setSummary((prev) => ({
          ...prev,
          totalDeposits:     depositTotal,
          totalWithdrawals:  withdrawalTotal,
          totalTransactions: total,
        }));

        setRecentTransactions(txns.slice(0, 8));
      }

      // ── Pending cash deposits ─────────────────────────────────────────────
      if (depositRes.status === "fulfilled" && depositRes.value.success) {
        const pending = depositRes.value.data.deposits || [];
        setPendingDeposits(pending.slice(0, 5));
        setSummary((prev) => ({
          ...prev,
          pendingCashDeposits: depositRes.value.data.pagination?.total ?? pending.length,
        }));
      }

      // ── Revenue ───────────────────────────────────────────────────────────
      if (revenueRes.status === "fulfilled" && revenueRes.value.success) {
        const rev = revenueRes.value.data.summary;
        setSummary((prev) => ({
          ...prev,
          totalOrderVolume: toNumber(rev?.total_volume),
          totalCommission:  toNumber(rev?.total_earnings),
        }));
      }
    } catch (err: any) {
      setError("Failed to load dashboard data. Please refresh.");
      console.error("AccountsOfficerDashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            💼 Finance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.fullName} — Accounts Officer
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Deposits</p>
              <p className="text-3xl font-bold">
                ${summary.totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-5xl opacity-40">💰</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-400 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Withdrawals</p>
              <p className="text-3xl font-bold">
                ${summary.totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-5xl opacity-40">📤</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Transactions</p>
              <p className="text-3xl font-bold">
                {summary.totalTransactions.toLocaleString()}
              </p>
            </div>
            <div className="text-5xl opacity-40">🔄</div>
          </div>
        </Card>

        <Card className={`${summary.pendingCashDeposits > 0 ? "bg-gradient-to-br from-orange-400 to-orange-500" : "bg-gradient-to-br from-gray-400 to-gray-500"} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Cash Deposits</p>
              <p className="text-3xl font-bold">{summary.pendingCashDeposits}</p>
              {summary.pendingCashDeposits > 0 && (
                <p className="text-xs opacity-80 mt-1">Requires attention ⚠️</p>
              )}
            </div>
            <div className="text-5xl opacity-40">💵</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Order Volume</p>
              <p className="text-3xl font-bold">
                ${summary.totalOrderVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-5xl opacity-40">📦</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Platform Commission</p>
              <p className="text-3xl font-bold">
                ${summary.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-5xl opacity-40">📊</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pending Cash Deposits */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Pending Cash Deposits
            </h2>
            <button
              onClick={() => navigate("/admin/cash-deposits")}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All →
            </button>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">✅</div>
              <p>No pending deposits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{deposit.full_name}</div>
                    <div className="text-xs text-gray-500">{deposit.email}</div>
                    <div className="text-xs text-gray-400">
                      Ref: {deposit.reference?.substring(0, 16)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${toNumber(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => navigate("/admin/cash-deposits")}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Review →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Transactions
            </h2>
            <button
              onClick={() => navigate("/admin/transactions")}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All →
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn, idx) => {
                const credit = isCredit(txn.type);
                return (
                  <div
                    key={txn.id || idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {txn.user_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {txn.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(txn.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className={`font-bold text-sm ${credit ? "text-green-600" : "text-red-600"}`}>
                        {credit ? "+" : "-"}${toNumber(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                        {txn.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: "💵", label: "Cash Deposits",  sub: "Approve pending",     path: "/admin/cash-deposits",  urgent: summary.pendingCashDeposits > 0 },
            { icon: "💳", label: "Transactions",   sub: "All wallet activity", path: "/admin/transactions",   urgent: false },
            { icon: "📊", label: "Revenue Report", sub: "Income & commission",  path: "/admin/revenue-report", urgent: false },
            { icon: "📦", label: "Orders",         sub: "Payment reconcile",   path: "/admin/orders",         urgent: false },
            { icon: "👥", label: "Users",          sub: "View & search",       path: "/admin/users",          urgent: false },
          ].map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                action.urgent
                  ? "border-orange-400 bg-orange-50 hover:border-orange-500"
                  : "border-transparent bg-white hover:border-green-500 shadow"
              }`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{action.label}</div>
              <div className="text-xs text-gray-500">{action.sub}</div>
              {action.urgent && (
                <div className="mt-2 text-xs font-medium text-orange-600">
                  {summary.pendingCashDeposits} pending ⚠️
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsOfficerDashboard;