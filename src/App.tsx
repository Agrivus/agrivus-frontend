import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ChatProvider } from "./contexts/ChatContext";
import { Layout, ProtectedRoute } from "./components/common";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Chat from "./pages/Chat";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import CreateOrder from "./pages/CreateOrder";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import TransportOffers from "./pages/TransportOffers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Wallet from "./pages/Wallet";
import Notifications from "./pages/Notifications";
import PaymentHistory from "./pages/PaymentHistory";
import Recommendations from "./pages/Recommendations";

// NEW: Auction pages
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import CreateAuction from "./pages/CreateAuction";
import MyBids from "./pages/MyBids";
import AuctionCheckout from "./pages/AuctionCheckout";
import AuctionWinner from "./pages/AuctionWinner";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminOrders from "./pages/AdminOrders";
import AdminTransactions from "./pages/AdminTransactions";
import AdminSecurity from "./pages/AdminSecurity";
import AdminReports from "./pages/AdminReports";
import AdminCashDeposits from "./pages/AdminCashDeposits";

// Moderator page (lazy loaded)
const ModeratorDashboard = React.lazy(() => import("./pages/ModeratorDashboard"));

// NEW: AgriMall pages
import AgriMallProducts from "./pages/AgriMallProducts";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AgriMallOrders from "./pages/AgriMallOrders";
import AgriMallOrderDetail from "./pages/AgriMallOrderDetail";

// Export Gateway pages
import ExportGateway from "./pages/ExportGateway";
import ExportAssessment from "./pages/ExportAssessment";
import ExportAssessmentResults from "./pages/ExportAssessmentResults";
import ExportMarketIntelligence from "./pages/ExportMarketIntelligence";
import ExportDocuments from "./pages/ExportDocuments";
import ExportLogistics from "./pages/ExportLogistics";
import MockPayment from "./pages/MockPayment";

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ChatProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route
                  path="/listings/create"
                  element={
                    <ProtectedRoute allowedRoles={["farmer"]}>
                      <CreateListing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-listings"
                  element={
                    <ProtectedRoute allowedRoles={["farmer"]}>
                      <MyListings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/create"
                  element={
                    <ProtectedRoute
                      allowedRoles={["buyer", "transporter", "farmer"]}
                    >
                      <CreateOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transport-offers"
                  element={
                    <ProtectedRoute allowedRoles={["transporter"]}>
                      <TransportOffers />
                    </ProtectedRoute>
                  }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* NEW: Chat route */}
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />

                {/* NEW: Auction Routes */}
                <Route path="/auctions" element={<Auctions />} />
                <Route path="/auctions/:id" element={<AuctionDetail />} />
                <Route
                  path="/auctions/create"
                  element={
                    <ProtectedRoute allowedRoles={["farmer"]}>
                      <CreateAuction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/auctions/:id/checkout"
                  element={
                    <ProtectedRoute allowedRoles={["buyer", "transporter"]}>
                      <AuctionCheckout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bids"
                  element={
                    <ProtectedRoute allowedRoles={["buyer", "transporter"]}>
                      <MyBids />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/auctions/:auctionId/winner"
                  element={
                    <ProtectedRoute>
                      <AuctionWinner />
                    </ProtectedRoute>
                  }
                />

                {/* NEW: AgriMall Routes */}
                <Route
                  path="/agrimall/products"
                  element={
                    <ProtectedRoute>
                      <AgriMallProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agrimall/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agrimall/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agrimall/orders"
                  element={
                    <ProtectedRoute>
                      <AgriMallOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agrimall/orders/:orderId"
                  element={
                    <ProtectedRoute>
                      <AgriMallOrderDetail />
                    </ProtectedRoute>
                  }
                />

                {/* NEW: Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "support_moderator"]}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:userId"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "support_moderator"]}>
                      <AdminUserDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "support_moderator"]}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/transactions"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "support_moderator"]}>
                      <AdminTransactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/cash-deposits"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminCashDeposits />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/security"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminSecurity />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />

                {/* Moderator Routes */}
                <Route
                  path="/moderator"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "support_moderator"]}>
                      <ModeratorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/moderator/activity-log"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "support_moderator"]}>
                      <ModeratorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Export Gateway Routes */}
                <Route
                  path="/export"
                  element={
                    <ProtectedRoute allowedRoles={["farmer", "admin"]}>
                      <ExportGateway />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export/assessment"
                  element={
                    <ProtectedRoute allowedRoles={["farmer", "admin"]}>
                      <ExportAssessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export/assessment/:assessmentId"
                  element={
                    <ProtectedRoute allowedRoles={["farmer", "admin"]}>
                      <ExportAssessmentResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export/market-intelligence"
                  element={
                    <ProtectedRoute allowedRoles={["farmer", "admin"]}>
                      <ExportMarketIntelligence />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export/documents"
                  element={
                    <ProtectedRoute allowedRoles={["farmer", "admin"]}>
                      <ExportDocuments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export/logistics"
                  element={
                    <ProtectedRoute allowedRoles={["farmer", "admin"]}>
                      <ExportLogistics />
                    </ProtectedRoute>
                  }
                />

                {/* Payment Mock Route */}
                <Route
                  path="/payment/mock/:paymentId"
                  element={<MockPayment />}
                />

                <Route
                  path="/payment/history"
                  element={
                    <ProtectedRoute>
                      <PaymentHistory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/recommendations"
                  element={
                    <ProtectedRoute>
                      <Recommendations />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </ChatProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
