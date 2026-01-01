import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import chatService from "../../services/chatService";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await chatService.getUnreadCount();
        if (response.success) {
          setUnreadChatCount(response.data.count);
        }
      } catch (error) {
        console.error("Failed to load unread chat count:", error);
      }
    };

    loadUnreadCount();

    // Listen for new messages to update count
    const handleNewMessage = () => {
      loadUnreadCount();
    };

    window.addEventListener("chat:new-message", handleNewMessage);
    return () =>
      window.removeEventListener("chat:new-message", handleNewMessage);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-dark-green text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4">
              <span>📞 +263 78 256 2211</span>
              <span>📧 agrivus438@gmail.com</span>
            </div>
            <div className="flex gap-4 items-center">
              {isAuthenticated ? (
                <>
                  <span className="text-accent-gold">
                    Welcome, {user?.fullName}
                  </span>
                  <Link
                    to="/dashboard"
                    className="hover:text-accent-gold transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="hover:text-accent-gold transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="hover:text-accent-gold transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hover:text-accent-gold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hover:text-accent-gold transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-green font-serif">
                  Agrivus
                </h1>
                <p className="text-xs text-gray-600 italic">
                  Digital Agricultural Ecosystem
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
              </Link>
              <Link
                to="/marketplace"
                className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
              >
                Marketplace
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
              </Link>

              {/* NEW: Auctions Link */}
              <Link
                to="/auctions"
                className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
              >
                Auctions
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
              </Link>

              {/* NEW: Agri-Mall Link */}
              {user && (
                <>
                  {console.log(
                    "User logged in, role:",
                    user?.role,
                    "Should show Export Gateway"
                  )}
                  <Link
                    to="/agrimall/products"
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Agri-Mall
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                  </Link>
                  <Link
                    to="/agrimall/orders"
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
                  >
                    My Orders
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                  </Link>
                  <Link
                    to="/export"
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
                  >
                    Export Gateway
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  {/* NEW: My Bids (Buyers only) */}
                  {user?.role === "buyer" && (
                    <Link
                      to="/my-bids"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
                    >
                      My Bids
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
                  >
                    Orders
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                  </Link>

                  <Link
                    to="/wallet"
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
                  >
                    Wallet
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                  </Link>

                  <NotificationBell />

                  {/* Messages link */}
                  <Link
                    to="/chat"
                    className="relative text-gray-700 hover:text-green-600 transition-colors flex items-center gap-2"
                    aria-label="Messages"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadChatCount > 9 ? "9+" : unreadChatCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <Link
                to="/about"
                className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-primary-green"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t animate-fade-up">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-green font-semibold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/marketplace"
                  className="text-gray-700 hover:text-primary-green font-semibold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  to="/auctions"
                  className="text-gray-700 hover:text-primary-green font-semibold transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Auctions
                </Link>
                {isAuthenticated && (
                  <>
                    {user?.role === "buyer" && (
                      <Link
                        to="/my-bids"
                        className="text-gray-700 hover:text-primary-green font-semibold transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Bids
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      to="/wallet"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Wallet
                    </Link>
                    <Link
                      to="/notifications"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Notifications
                    </Link>
                    <Link
                      to="/chat"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Messages
                      {unreadChatCount > 0 && (
                        <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                          {unreadChatCount > 9 ? "9+" : unreadChatCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-primary-green font-semibold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
