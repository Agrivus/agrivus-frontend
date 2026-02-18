import React, { useEffect, useState } from "react";
import { getAdminStats } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../types";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "support_moderator") {
      navigate("/dashboard");
      return;
    }
    fetchStats();
  }, [user, navigate]);

  // Helper to extract real numbers from new API structure
  const getOverview = () => {
    if (!stats)
      return {
        totalUsers: 0,
        totalListings: 0,
        totalOrders: 0,
        totalVolume: 0,
      };
    if (stats.overview) return stats.overview;
    // fallback for old API
    return {
      totalUsers: stats.totalUsers || 0,
      totalListings: stats.totalListings || 0,
      totalOrders: stats.totalOrders || 0,
      totalVolume: stats.totalVolume || 0,
    };
  };

  type DashboardUserBreakdown = Record<
    "farmer" | "buyer" | "transporter" | "supplier",
    number
  >;

  const getUserBreakdown = (): DashboardUserBreakdown => {
    if (!stats) return { farmer: 0, buyer: 0, transporter: 0, supplier: 0 };

    // Use data.users from API response
    if (stats.users) {
      const breakdown: DashboardUserBreakdown = {
        farmer: 0,
        buyer: 0,
        transporter: 0,
        supplier: 0,
      };
      (stats.users as Array<{ role: UserRole; count: string }>).forEach(
        (row) => {
          if (row.role === "agro_supplier")
            breakdown.supplier = Number(row.count);
          else if (
            row.role === "farmer" ||
            row.role === "buyer" ||
            row.role === "transporter"
          ) {
            breakdown[row.role as "farmer" | "buyer" | "transporter"] = Number(
              row.count,
            );
          }
        },
      );
      return breakdown;
    }
    // Fallback
    return { farmer: 0, buyer: 0, transporter: 0, supplier: 0 };
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin" && user?.role !== "support_moderator") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need admin privileges to access this page
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-green">
          🛡️ Admin Dashboard
        </h1>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Platform Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-3xl font-bold">
                      {getOverview().totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">👥</div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Listings</p>
                    <p className="text-3xl font-bold">
                      {getOverview().totalListings.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">📦</div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Orders</p>
                    <p className="text-3xl font-bold">
                      {getOverview().totalOrders.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">🛒</div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Volume</p>
                    <p className="text-3xl font-bold">
                      ${getOverview().totalVolume.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">💰</div>
                </div>
              </Card>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              User Breakdown by Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="text-center">
                  <div className="text-4xl mb-2">👨‍🌾</div>
                  <p className="text-2xl font-bold text-primary-green">
                    {getUserBreakdown().farmer}
                  </p>
                  <p className="text-sm text-gray-600">Farmers</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-4xl mb-2">🛒</div>
                  <p className="text-2xl font-bold text-primary-green">
                    {getUserBreakdown().buyer}
                  </p>
                  <p className="text-sm text-gray-600">Buyers</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-4xl mb-2">🚚</div>
                  <p className="text-2xl font-bold text-primary-green">
                    {getUserBreakdown().transporter}
                  </p>
                  <p className="text-sm text-gray-600">Transporters</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-4xl mb-2">🏪</div>
                  <p className="text-2xl font-bold text-primary-green">
                    {getUserBreakdown().supplier}
                  </p>
                  <p className="text-sm text-gray-600">Suppliers</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Order Status Overview
            </h2>
            <Card>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {stats.orders && stats.orders.length > 0 ? (
                  stats.orders.map(
                    (order: { status: string; count: string }) => (
                      <div
                        key={order.status}
                        className="text-center p-4 bg-light-green rounded-lg"
                      >
                        <p className="text-2xl font-bold text-primary-green">
                          {Number(order.count)}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {order.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-center text-gray-500 py-4 col-span-full">
                    No order data available
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Revenue & Commission */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Financial Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-light-green">
                <p className="text-sm text-gray-600 mb-2">
                  Total Platform Volume
                </p>
                <p className="text-3xl font-bold text-primary-green">
                  $
                  {Number(
                    stats.revenue?.total_volume ||
                      getOverview().totalVolume ||
                      0,
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </Card>

              <Card className="bg-light-green">
                <p className="text-sm text-gray-600 mb-2">
                  Total Commission Earned
                </p>
                <p className="text-3xl font-bold text-accent-gold">
                  $
                  {Number(stats.revenue?.total_commission || 0).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </p>
              </Card>

              <Card className="bg-light-green">
                <p className="text-sm text-gray-600 mb-2">
                  Average Order Value
                </p>
                <p className="text-3xl font-bold text-primary-green">
                  $
                  {getOverview().totalOrders > 0
                    ? (
                        getOverview().totalVolume / getOverview().totalOrders
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Activity
            </h2>
            <Card>
              <div className="space-y-4">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          Order #{order.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.crop_type || "N/A"} • {order.quantity}{" "}
                          {order.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-green">
                          $
                          {parseFloat(order.total_amount || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            order.status === "confirmed" ||
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "paid"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "pending" ||
                                    order.status === "payment_pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No recent activity
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">👥</div>
                <h3 className="font-bold text-gray-800">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View, edit, suspend users
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/orders")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-bold text-gray-800">View All Orders</h3>
                <p className="text-sm text-gray-600">
                  Monitor all transactions
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/transactions")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">💳</div>
                <h3 className="font-bold text-gray-800">Transactions</h3>
                <p className="text-sm text-gray-600">
                  View wallet transactions
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/cash-deposits")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">💵</div>
                <h3 className="font-bold text-gray-800">
                  Verify Cash Deposits
                </h3>
                <p className="text-sm text-gray-600">
                  Approve pending deposits
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/security")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="font-bold text-gray-800">Security</h3>
                <p className="text-sm text-gray-600">
                  Monitor security incidents
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/reports")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-bold text-gray-800">Generate Reports</h3>
                <p className="text-sm text-gray-600">Export analytics & data</p>
              </button>

              <button
                onClick={() => navigate("/export")}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-green"
              >
                <div className="text-4xl mb-2">🌍</div>
                <h3 className="font-bold text-gray-800">Export Gateway</h3>
                <p className="text-sm text-gray-600">
                  Monitor export activities
                </p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
