import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ChatProvider } from "./contexts/ChatContext";
import { Layout, ProtectedRoute } from "./components/common";

const Home = React.lazy(() => import("./pages/Home"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const Chat = React.lazy(() => import("./pages/Chat"));
const ListingDetail = React.lazy(() => import("./pages/ListingDetail"));
const CreateListing = React.lazy(() => import("./pages/CreateListing"));
const MyListings = React.lazy(() => import("./pages/MyListings"));
const CreateOrder = React.lazy(() => import("./pages/CreateOrder"));
const Orders = React.lazy(() => import("./pages/Orders"));
const OrderDetail = React.lazy(() => import("./pages/OrderDetail"));
const TransportOffers = React.lazy(() => import("./pages/TransportOffers"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Wallet = React.lazy(() => import("./pages/Wallet"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const PaymentHistory = React.lazy(() => import("./pages/PaymentHistory"));
const Recommendations = React.lazy(() => import("./pages/Recommendations"));
const Auctions = React.lazy(() => import("./pages/Auctions"));
const AuctionDetail = React.lazy(() => import("./pages/AuctionDetail"));
const CreateAuction = React.lazy(() => import("./pages/CreateAuction"));
const MyBids = React.lazy(() => import("./pages/MyBids"));
const AuctionCheckout = React.lazy(() => import("./pages/AuctionCheckout"));
const AuctionWinner = React.lazy(() => import("./pages/AuctionWinner"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = React.lazy(() => import("./pages/AdminUsers"));
const AdminUserDetail = React.lazy(() => import("./pages/AdminUserDetail"));
const AdminOrders = React.lazy(() => import("./pages/AdminOrders"));
const AdminTransactions = React.lazy(() => import("./pages/AdminTransactions"));
const AdminSecurity = React.lazy(() => import("./pages/AdminSecurity"));
const AdminReports = React.lazy(() => import("./pages/AdminReports"));
const AdminCashDeposits = React.lazy(
  () => import("./pages/AdminCashDeposits"),
);
const ModeratorDashboard = React.lazy(() => import("./pages/ModeratorDashboard"));
const AgriMallProducts = React.lazy(() => import("./pages/AgriMallProducts"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const AgriMallOrders = React.lazy(() => import("./pages/AgriMallOrders"));
const AgriMallOrderDetail = React.lazy(
  () => import("./pages/AgriMallOrderDetail"),
);
const ExportGateway = React.lazy(() => import("./pages/ExportGateway"));
const ExportAssessment = React.lazy(() => import("./pages/ExportAssessment"));
const ExportAssessmentResults = React.lazy(
  () => import("./pages/ExportAssessmentResults"),
);
const ExportMarketIntelligence = React.lazy(
  () => import("./pages/ExportMarketIntelligence"),
);
const ExportDocuments = React.lazy(() => import("./pages/ExportDocuments"));
const ExportLogistics = React.lazy(() => import("./pages/ExportLogistics"));
const MockPayment = React.lazy(() => import("./pages/MockPayment"));

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ChatProvider>
          <Router>
            <Layout>
              <React.Suspense
                fallback={
                  <div className="min-h-[50vh] flex items-center justify-center text-gray-600">
                    Loading...
                  </div>
                }
              >
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
              </React.Suspense>
            </Layout>
          </Router>
        </ChatProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
