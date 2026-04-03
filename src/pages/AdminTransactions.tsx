import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAllTransactions } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";

interface Transaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  order_id: string | null;
  payment_id: string | null;
  description: string;
  created_at: string;
  user_name: string;
  user_email: string;
  role: string;
}

// Types that represent money coming IN to a wallet (positive)
const CREDIT_TYPES = new Set([
  "deposit",
  "refund",
  "escrow_release",
  "commission",
]);

function isCredit(type: string): boolean {
  return CREDIT_TYPES.has(type.toLowerCase());
}

const toDisplayText = (value: unknown, fallback = "N/A") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const TYPE_LABELS: Record<string, string> = {
  deposit:        "DEPOSIT",
  withdrawal:     "WITHDRAWAL",
  payment:        "PAYMENT",
  refund:         "REFUND",
  escrow_hold:    "ESCROW HOLD",
  escrow_release: "ESCROW RELEASE",
  commission:     "COMMISSION",
  transport_fee:  "TRANSPORT FEE",
};

const TYPE_COLORS: Record<string, string> = {
  deposit:        "bg-green-100 text-green-800",
  withdrawal:     "bg-red-100 text-red-800",
  payment:        "bg-orange-100 text-orange-800",
  refund:         "bg-blue-100 text-blue-800",
  escrow_hold:    "bg-yellow-100 text-yellow-800",
  escrow_release: "bg-teal-100 text-teal-800",
  commission:     "bg-purple-100 text-purple-800",
  transport_fee:  "bg-indigo-100 text-indigo-800",
};

export default function AdminTransactions() {
  const { user } = useAuth();
  const isAccountsOfficer = user?.role === "accounts_officer";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({ type: "" });
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    creditsCount: 0,
    debitsCount: 0,
  });

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getAllTransactions({
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type || undefined,
      });

      if (response.success) {
        const txns: Transaction[] = response.data.transactions || [];
        setTransactions(txns);
        setPagination(
          response.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
        );

        // Calculate stats from current page + pagination total
        const credits = txns.filter((t) => isCredit(t.type));
        const debits  = txns.filter((t) => !isCredit(t.type));

        // Total volume = sum of all deposit amounts (money actually received)
        const depositVolume = txns
          .filter((t) => t.type === "deposit")
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        setStats({
          totalTransactions: response.data.pagination?.total ?? txns.length,
          totalVolume:       depositVolume,
          creditsCount:      credits.length,
          debitsCount:       debits.length,
        });
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600">Monitor all wallet transactions</p>
        </div>
        <Link
          to={isAccountsOfficer ? "/accounts" : "/admin"}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalTransactions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Total Deposits</div>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.creditsCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Credits (this page)</div>
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.debitsCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Debits (this page)</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end md:col-span-2">
            <button
              onClick={() => { setFilters({ type: "" }); setPagination((p) => ({ ...p, page: 1 })); }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((txn, index) => {
                  const type      = toDisplayText(txn?.type, "unknown").toLowerCase();
                  const amount    = toNumber(txn?.amount);
                  const credit    = isCredit(type);
                  const createdAt = txn?.created_at
                    ? new Date(txn.created_at).toLocaleString()
                    : "N/A";

                  return (
                    <tr key={txn?.id || `txn-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          #{toDisplayText(txn?.id, "").substring(0, 8) || "UNKNOWN"}
                        </div>
                        <div className="text-sm text-gray-500">{toDisplayText(txn?.description)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{txn.user_name}</div>
                        <div className="text-sm text-gray-500">{toDisplayText(txn?.user_email)}</div>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {toDisplayText(txn?.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[type] ?? "bg-gray-100 text-gray-800"}`}>
                          {TYPE_LABELS[type] ?? type.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${credit ? "text-green-600" : "text-red-600"}`}>
                          {credit ? "+" : "-"}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ${toNumber(txn?.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {createdAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} transactions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg">{pagination.page}</span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}