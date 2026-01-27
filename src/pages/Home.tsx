import React from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Guest Home Page (not logged in)
  const GuestHome = () => (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-primary-green text-white py-32 px-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26, 92, 42, 0.9), rgba(26, 92, 42, 0.9)), url(https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center animate-fade-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-serif">
            Building the Digital Agricultural Economy for Africa
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            From Farm to Global Market, Seamlessly - Empowering Smallholder
            Farmers Through Technology
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register?role=farmer">
              <Button variant="primary" size="lg">
                Join as Farmer
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-light-green">
        <div className="container mx-auto px-4">
          <div className="section-title">
            <h2>Why Choose Agrivus?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-t-4 border-vibrant-green">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-4 font-serif">
                Direct Market Access
              </h3>
              <p className="text-gray-600">
                Connect directly with buyers and eliminate middlemen. Get fair
                prices for your produce.
              </p>
            </Card>

            <Card className="p-8 text-center border-t-4 border-vibrant-green">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-4 font-serif">
                Smart Logistics
              </h3>
              <p className="text-gray-600">
                AI-powered transport matching ensures efficient delivery at
                competitive rates.
              </p>
            </Card>

            <Card className="p-8 text-center border-t-4 border-vibrant-green">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-4 font-serif">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Escrow-protected transactions with multiple payment options
                including EcoCash and ZIPIT.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-green mb-6 font-serif">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers, buyers, and transporters already using
            Agrivus to grow their business.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );

  // Farmer Home Page
  const FarmerHome = () => (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-primary-green text-white py-20 px-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26, 92, 42, 0.85), rgba(26, 92, 42, 0.9)), url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                Welcome back, {user?.fullName}! 🌾
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Ready to grow your farming business today?
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/listings/create">
                  <Button variant="primary" size="lg">
                    ➕ Create New Listing
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg">
                    📊 View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">
                {user?.platformScore || 0}
              </div>
              <div className="text-sm opacity-80">Platform Score</div>
              <div className="mt-4 text-2xl font-bold">
                {user?.totalTransactions || 0}
              </div>
              <div className="text-sm opacity-80">Total Sales</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-light-green">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-green mb-6 font-serif">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/my-listings">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-primary-green">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-bold text-primary-green">My Listings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your products
                </p>
              </Card>
            </Link>
            <Link to="/orders">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-primary-green">Orders</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View incoming orders
                </p>
              </Card>
            </Link>
            <Link to="/auctions">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-yellow-500">
                <div className="text-4xl mb-3">🔨</div>
                <h3 className="font-bold text-primary-green">Auctions</h3>
                <p className="text-sm text-gray-600 mt-1">Sell via auction</p>
              </Card>
            </Link>
            <Link to="/wallet">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-primary-green">Wallet</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your earnings
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features for Farmers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-green mb-8 font-serif text-center">
            Maximize Your Farm's Potential
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-t-4 border-vibrant-green">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-primary-green mb-2">
                Export Gateway
              </h3>
              <p className="text-gray-600 mb-4">
                Access international markets and get premium prices for your
                quality produce.
              </p>
              <Link to="/export">
                <Button variant="outline" size="sm">
                  Explore Exports →
                </Button>
              </Link>
            </Card>
            <Card className="p-6 border-t-4 border-blue-500">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-primary-green mb-2">
                Direct Chat
              </h3>
              <p className="text-gray-600 mb-4">
                Communicate directly with buyers and negotiate better deals.
              </p>
              <Link to="/chat">
                <Button variant="outline" size="sm">
                  Open Messages →
                </Button>
              </Link>
            </Card>
            <Card className="p-6 border-t-4 border-yellow-500">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-primary-green mb-2">
                Boost Your Listings
              </h3>
              <p className="text-gray-600 mb-4">
                Stay active to increase your visibility and attract more buyers.
              </p>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  View Boost Status →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h3 className="text-xl font-bold text-primary-green mb-4">
              💡 Tips to Increase Your Sales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Add high-quality photos to your listings
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-700">Keep your prices competitive</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Respond quickly to buyer inquiries
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Maintain your activity streak for better visibility
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );

  // Buyer Home Page
  const BuyerHome = () => (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-blue-900 text-white py-20 px-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.85)), url(https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                Welcome back, {user?.fullName}! 🛒
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Discover fresh produce directly from local farmers
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/marketplace">
                  <Button variant="primary" size="lg">
                    🛍️ Browse Marketplace
                  </Button>
                </Link>
                <Link to="/auctions">
                  <Button variant="outline" size="lg">
                    🔨 Live Auctions
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">
                {user?.totalTransactions || 0}
              </div>
              <div className="text-sm opacity-80">Total Orders</div>
              <div className="mt-4 text-2xl font-bold">
                ${parseFloat(user?.totalVolume || "0").toLocaleString()}
              </div>
              <div className="text-sm opacity-80">Total Spent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-green mb-6 font-serif">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/marketplace">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-primary-green">
                <div className="text-4xl mb-3">🥬</div>
                <h3 className="font-bold text-primary-green">Marketplace</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Browse fresh produce
                </p>
              </Card>
            </Link>
            <Link to="/orders">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-primary-green">My Orders</h3>
                <p className="text-sm text-gray-600 mt-1">Track your orders</p>
              </Card>
            </Link>
            <Link to="/cart">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-yellow-500">
                <div className="text-4xl mb-3">🛒</div>
                <h3 className="font-bold text-primary-green">Cart</h3>
                <p className="text-sm text-gray-600 mt-1">View your cart</p>
              </Card>
            </Link>
            <Link to="/chat">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-bold text-primary-green">Messages</h3>
                <p className="text-sm text-gray-600 mt-1">Chat with farmers</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features for Buyers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-green mb-8 font-serif text-center">
            Why Buy on Agrivus?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-t-4 border-vibrant-green">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-primary-green mb-2">
                Farm Fresh
              </h3>
              <p className="text-gray-600 mb-4">
                Get produce directly from verified farmers. No middlemen,
                maximum freshness.
              </p>
            </Card>
            <Card className="p-6 border-t-4 border-blue-500">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-primary-green mb-2">
                Best Prices
              </h3>
              <p className="text-gray-600 mb-4">
                Competitive pricing with transparent costs. Compare and save on
                bulk orders.
              </p>
            </Card>
            <Card className="p-6 border-t-4 border-yellow-500">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-primary-green mb-2">
                Reliable Delivery
              </h3>
              <p className="text-gray-600 mb-4">
                AI-matched transporters ensure your produce arrives fresh and on
                time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-green mb-6 font-serif">
            Popular Categories
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: "Vegetables", emoji: "🥬" },
              { name: "Fruits", emoji: "🍎" },
              { name: "Grains", emoji: "🌾" },
              { name: "Legumes", emoji: "🫘" },
              { name: "Dairy", emoji: "🥛" },
              { name: "Livestock", emoji: "🐄" },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/marketplace?category=${category.name.toLowerCase()}`}
              >
                <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <p className="text-sm font-medium text-gray-700">
                    {category.name}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif">
            Ready to Find Fresh Produce?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Browse thousands of listings from verified farmers
          </p>
          <Link to="/marketplace">
            <Button variant="primary" size="lg">
              Start Shopping →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );

  // Transporter Home Page
  const TransporterHome = () => (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-orange-900 text-white py-20 px-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(154, 52, 18, 0.9), rgba(154, 52, 18, 0.85)), url(https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                Welcome back, {user?.fullName}! 🚚
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Ready to deliver and earn today?
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/orders">
                  <Button variant="primary" size="lg">
                    📋 View Available Jobs
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg">
                    📊 My Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">
                {user?.totalTransactions || 0}
              </div>
              <div className="text-sm opacity-80">Deliveries Completed</div>
              <div className="mt-4 text-2xl font-bold">
                ${parseFloat(user?.totalVolume || "0").toLocaleString()}
              </div>
              <div className="text-sm opacity-80">Total Earnings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-orange-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-green mb-6 font-serif">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/orders">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-orange-500">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-primary-green">Available Jobs</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Find new deliveries
                </p>
              </Card>
            </Link>
            <Link to="/orders?status=in_progress">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                <div className="text-4xl mb-3">🚛</div>
                <h3 className="font-bold text-primary-green">
                  Active Deliveries
                </h3>
                <p className="text-sm text-gray-600 mt-1">Current jobs</p>
              </Card>
            </Link>
            <Link to="/wallet">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-primary-green">Earnings</h3>
                <p className="text-sm text-gray-600 mt-1">View your wallet</p>
              </Card>
            </Link>
            <Link to="/chat">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-bold text-primary-green">Messages</h3>
                <p className="text-sm text-gray-600 mt-1">Customer support</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-green mb-8 font-serif text-center">
            Your Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-orange-600">
                {user?.platformScore || 0}
              </div>
              <div className="text-sm text-gray-600">Platform Score</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-3xl font-bold text-blue-600">
                {user?.totalTransactions || 0}
              </div>
              <div className="text-sm text-gray-600">Total Deliveries</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="text-4xl mb-2">💵</div>
              <div className="text-3xl font-bold text-green-600">
                ${parseFloat(user?.totalVolume || "0").toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-purple-600">
                {user?.streakDays || 0}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h3 className="text-xl font-bold text-primary-green mb-4">
              🚀 Tips to Maximize Your Earnings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-orange-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Stay active during peak hours for more job opportunities
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Maintain high ratings for priority job matching
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Complete deliveries on time to build your reputation
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 text-xl">✓</span>
                <p className="text-gray-700">
                  Keep your vehicle details updated for better matching
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif">
            Ready to Start Delivering?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Check available jobs in your area
          </p>
          <Link to="/orders">
            <Button variant="primary" size="lg">
              Find Jobs →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );

  // Admin/Agro Supplier Home - Default to dashboard redirect
  const AdminHome = () => (
    <div>
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 font-serif">
            Welcome, {user?.fullName}! 👋
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Access your admin dashboard to manage the platform
          </p>
          <Link to="/admin">
            <Button variant="primary" size="lg">
              Go to Admin Dashboard →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );

  // Render based on user role
  if (!isAuthenticated) {
    return <GuestHome />;
  }

  switch (user?.role) {
    case "farmer":
      return <FarmerHome />;
    case "buyer":
      return <BuyerHome />;
    case "transporter":
      return <TransporterHome />;
    case "admin":
    case "agro_supplier":
      return <AdminHome />;
    default:
      return <GuestHome />;
  }
};

export default Home;
