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
            From Farm to Global Market, Seamlessly
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect with buyers, access premium markets, and grow your
            agricultural business with Africa's most comprehensive digital
            platform. Real-time pricing, secure transactions, and export
            opportunities—all in one place.
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
        <div className="container mx-auto px-4 md:px-16 lg:px-32">
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

      {/* Platform Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-16 lg:px-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="mb-6">
                <span className="inline-block bg-yellow-100 text-accent-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  ⚡ Platform Features
                </span>
              </div>
              <h2 className="text-4xl font-bold text-dark-gray mb-4 font-serif">
                Everything You Need to Succeed in Agricultural Trade
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Agrivus provides powerful tools designed specifically for
                African farmers, buyers, and transporters to maximize their
                potential.
              </p>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-green text-white">
                      <svg
                        className="h-6 w-6"
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
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-green mb-2">
                      Real-Time Market Insights
                    </h3>
                    <p className="text-gray-600">
                      Access live pricing data, market trends, and AI-powered
                      recommendations to make informed decisions.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-green text-white">
                      <svg
                        className="h-6 w-6"
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
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-green mb-2">
                      Secure Transactions
                    </h3>
                    <p className="text-gray-600">
                      Built-in wallet system and secure payment processing
                      ensure safe transactions for all parties.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-green text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-green mb-2">
                      Export Gateway
                    </h3>
                    <p className="text-gray-600">
                      Connect directly with international buyers and access
                      export documentation support.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-green text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-green mb-2">
                      Activity Boost System
                    </h3>
                    <p className="text-gray-600">
                      Build your platform score with transactions and get better
                      visibility in marketplace searches.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                alt="Agricultural Technology"
                className="rounded-lg shadow-lg w-full h-auto"
              />
              {/* Stats Overlay */}
              <div className="absolute bottom-8 left-8 right-8 bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-green">
                      24/7
                    </div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-green">
                      100%
                    </div>
                    <div className="text-sm text-gray-600">Secure</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-green">
                      Fast
                    </div>
                    <div className="text-sm text-gray-600">Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Role Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-16 lg:px-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
              Built for Every Role in Agriculture
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're growing, buying, or moving agricultural products,
              Agrivus has the tools you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Farmers Card */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-300 to-green-500 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                  alt="Farmer in field"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 bg-green-50">
                <div className="w-12 h-12 bg-primary-green rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  For Farmers
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>List unlimited products on the marketplace</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Participate in auctions for better pricing</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Access export opportunities globally</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Track sales and manage inventory</span>
                  </li>
                </ul>
                <Link to="/register?role=farmer" className="w-full">
                  <Button variant="primary" size="lg" className="w-full">
                    Register as Farmer
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Buyers Card */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-yellow-300 to-yellow-500 relative overflow-hidden">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8Lqs-QkPR7Ebt1GBBDQYTl1fmwln7AdItVw&s"
                  alt="Buyer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 bg-yellow-50">
                <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-0.9-2-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  For Buyers
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Browse verified products from trusted farmers</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Place competitive bids in live auctions</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Access bulk purchase options</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Secure payment and order tracking</span>
                  </li>
                </ul>
                <Link to="/register?role=buyer" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-accent-gold hover:bg-yellow-600"
                  >
                    Register as Buyer
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Transporters Card */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-cyan-300 to-cyan-500 relative overflow-hidden">
                <img
                  src="https://media.istockphoto.com/id/492316094/photo/trailer-laden-with-cabbage.jpg?s=612x612&w=0&k=20&c=fFMDMqvtuUe8-p88q0tB2sMDrxDpxJ3lTFjhtsFPf3Q="
                  alt="Transport"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 bg-cyan-50">
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 12l1.5-4.5h11L19 12H5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  For Transporters
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      Connect with farmers and buyers needing logistics
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Manage routes and optimize delivery schedules</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Receive timely payments for services</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg
                      className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Build your reputation score</span>
                  </li>
                </ul>
                <Link to="/register?role=transporter" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                  >
                    Register as Transporter
                  </Button>
                </Link>
              </div>
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
