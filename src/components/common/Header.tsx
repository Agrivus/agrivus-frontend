import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import chatService from "../../services/chatService";
import logoImage from "../../assets/logo.png";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await chatService.getUnreadConversationsCount();
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

    // Listen for messages being read to update count
    const handleMessageRead = () => {
      loadUnreadCount();
    };

    window.addEventListener("chat:new-message", handleNewMessage);
    window.addEventListener("chat:message-read", handleMessageRead);

    // Poll for updates every 30 seconds as fallback
    const pollInterval = setInterval(loadUnreadCount, 30000);

    return () => {
      window.removeEventListener("chat:new-message", handleNewMessage);
      window.removeEventListener("chat:message-read", handleMessageRead);
      clearInterval(pollInterval);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { to: "/", label: "Home" },
      { to: "/marketplace", label: "Marketplace" },
      { to: "/auctions", label: "Auctions" },
    ];

    if (!isAuthenticated) {
      return [...baseLinks, { to: "/about", label: "About" }];
    }

    const authenticatedLinks = [
      ...baseLinks,
      { to: "/agrimall/products", label: "Agri-Mall" },
      { to: "/agrimall/orders", label: "My Orders" },
      { to: "/recommendations", label: "Insights" },
    ];

    // Add Export Gateway for farmers only
    if (user?.role === "farmer") {
      authenticatedLinks.push({ to: "/export", label: "Export Gateway" });
    }

    // Add role-specific links
    if (user?.role === "buyer" || user?.role === "transporter") {
      authenticatedLinks.push({ to: "/my-bids", label: "My Bids" });
    }

    // Don't add wallet for admins
    if (user?.role !== "admin") {
      authenticatedLinks.push({ to: "/wallet", label: "Wallet" });
    }

    authenticatedLinks.push(
      { to: "/orders", label: "Orders" },
      { to: "/about", label: "About" },
    );

    return authenticatedLinks;
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-dark-green text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            {/* Contact info - hidden on mobile */}
            <div className="hidden md:flex gap-4">
              <span>📞 +263 78 256 2211</span>
              <span>📧 agrivus438@gmail.com</span>
            </div>
            {/* Spacer on mobile */}
            <div className="md:hidden"></div>

            <div className="flex gap-4 items-center">
              {isAuthenticated ? (
                <>
                  {/* Welcome text - hidden on mobile */}
                  <span className="hidden md:inline text-accent-gold">
                    Welcome, {user?.fullName}
                  </span>
                  {user?.role === "admin" ? (
                    <Link
                      to="/admin"
                      className="hover:text-accent-gold transition-colors flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Admin
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="hover:text-accent-gold transition-colors"
                    >
                      Dashboard
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
        {/* Logo Section */}
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoImage}
                alt="Agrivus Logo"
                className="w-auto h-12 rounded-full object-cover transition-transform group-hover:scale-110 group-hover:rotate-6"
              />
              <div className="hidden sm:block">
                <span className="text-xs font-medium tracking-wider uppercase bg-gradient-to-r from-primary-green via-medium-green to-accent-gold bg-clip-text text-transparent">
                  Digital Agricultural Ecosystem
                </span>
              </div>
            </Link>

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
        </div>

        {/* Divider Line */}
        <div className="border-t border-gray-200"></div>

        {/* Desktop Navigation Row */}
        <div className="hidden md:block bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-end items-center py-3 gap-8">
              {/* Navigation Links */}
              <nav className="flex items-center gap-6">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-gold transition-all group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>

              {/* Chat and Notifications Icons (far right) */}
              {isAuthenticated && (
                <div className="flex items-center gap-4">
                  <NotificationBell />

                  {/* Messages link */}
                  <Link
                    to="/chat"
                    className="relative text-gray-700 hover:text-green-600 transition-colors"
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-fade-up bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-700 hover:text-primary-green font-semibold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Link
                      to="/notifications"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      Notifications
                    </Link>
                    <Link
                      to="/chat"
                      className="text-gray-700 hover:text-primary-green font-semibold transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
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
                      Messages
                      {unreadChatCount > 0 && (
                        <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                          {unreadChatCount > 9 ? "9+" : unreadChatCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
