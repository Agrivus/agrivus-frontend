import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import chatService from "../../services/chatService";
import logoImage from "../../assets/full_logo.png";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const unreadRequestVersionRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isDisposed = false;

    const loadUnreadCount = async () => {
      const requestVersion = ++unreadRequestVersionRef.current;
      try {
        const response = await chatService.getUnreadConversationsCount();
        if (
          !isDisposed &&
          requestVersion === unreadRequestVersionRef.current &&
          response.success
        ) {
          setUnreadChatCount(response.data.count);
        }
      } catch (error) {
        console.error("Failed to load unread chat count:", error);
      }
    };

    loadUnreadCount();

    const handleNewMessage = () => loadUnreadCount();
    const handleMessageRead = () => loadUnreadCount();
    const handleMessagesRead = () => loadUnreadCount();
    const handleWindowFocus = () => loadUnreadCount();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") loadUnreadCount();
    };

    window.addEventListener("chat:new-message", handleNewMessage);
    window.addEventListener("chat:message-read", handleMessageRead);
    window.addEventListener("chat:messages-read", handleMessagesRead);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const pollInterval = setInterval(loadUnreadCount, 30000);

    return () => {
      isDisposed = true;
      window.removeEventListener("chat:new-message", handleNewMessage);
      window.removeEventListener("chat:message-read", handleMessageRead);
      window.removeEventListener("chat:messages-read", handleMessagesRead);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    setUnreadChatCount(0);
    logout();
    navigate("/");
  };

  const displayUnreadChatCount = isAuthenticated ? unreadChatCount : 0;

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
      { to: "/agrimall/orders", label: "Mall Orders" },
      // FUTURE WORK: Enable when Insights feature is ready
      // { to: "/recommendations", label: "Insights" },
    ];

    if (user?.role === "farmer" || user?.role === "admin") {
      // FUTURE WORK: Enable when Export Gateway feature is ready
      // authenticatedLinks.push({ to: "/export", label: "Export Gateway" });
      authenticatedLinks.push({ to: "/farm-log", label: "Farm Log" });
      authenticatedLinks.push({ to: "/farm-os", label: "Farm OS" });
    }

    if (user?.role === "transporter") {
      authenticatedLinks.push({
        to: "/transport-offers",
        label: "Transport Offers",
      });
    }

    if (user?.role === "buyer" || user?.role === "transporter") {
      authenticatedLinks.push({ to: "/my-bids", label: "My Bids" });
    }

    // Accounts officer gets direct links to finance pages
    if (user?.role === "accounts_officer") {
      authenticatedLinks.push(
        { to: "/admin/transactions", label: "Transactions" },
        { to: "/admin/cash-deposits", label: "Cash Deposits" },
        { to: "/admin/revenue-report", label: "Revenue" },
      );
    }

    authenticatedLinks.push(
      { to: "/wallet", label: "Wallet" },
      { to: "/orders", label: "Orders" },
      { to: "/about", label: "About" },
    );

    return authenticatedLinks;
  };

  // Determine top-bar staff link based on role
  const getStaffLink = () => {
    if (user?.role === "admin") {
      return {
        to: "/admin",
        label: "Admin",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    }
    if (user?.role === "support_moderator") {
      return {
        to: "/moderator",
        label: "Moderator",
        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      };
    }
    if (user?.role === "accounts_officer") {
      return {
        to: "/accounts",
        label: "Finance",
        icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      };
    }
    return null;
  };

  const staffLink = getStaffLink();

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-[0_4px_20px_rgb(0,0,0,0.05)] sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 group">
            <img
              src={logoImage}
              alt="Agrivus Logo"
              className="w-auto h-12 rounded-xl object-cover shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase bg-gradient-to-r from-primary-green to-accent-gold bg-clip-text text-transparent">
                DIGITAL AGRICULTURAL ECOSYSTEM
              </span>
            </div>
          </Link>

          {/* Desktop Right Alignment: User Controls & Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {staffLink ? (
                  <Link
                    to={staffLink.to}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary-green hover:bg-green-700 shadow-[0_4px_12px_rgba(21,128,61,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(21,128,61,0.4)] transform hover:-translate-y-0.5 transition-all duration-300"
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
                        d={staffLink.icon}
                      />
                    </svg>
                    {staffLink.label}
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary-green hover:bg-green-700 shadow-[0_4px_12px_rgba(21,128,61,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(21,128,61,0.4)] transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)] transform hover:-translate-y-0.5 transition-all duration-300"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>

                {/* Subtle Divider */}
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-2"></div>

                {/* Profile Element */}
                <div className="flex items-center gap-3 pl-2 pr-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green to-medium-green text-white flex items-center justify-center font-bold text-lg shadow-[0_3px_8px_rgba(21,128,61,0.25),inset_0_2px_4px_rgba(255,255,255,0.2)]">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight">
                      Good day,
                    </span>
                    <span className="text-sm font-bold text-gray-800 leading-tight tracking-tight">
                      {user?.fullName?.split(" ")[0]}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-700 bg-gray-50/80 hover:bg-white hover:text-primary-green shadow-[inset_0_1px_3px_rgba(0,0,0,0.02),0_2px_5px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100/50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary-green hover:bg-green-700 shadow-[0_4px_12px_rgba(21,128,61,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_16px_rgba(21,128,61,0.4)] transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
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

      {/* Desktop Navigation Link Bar */}
      <div className="hidden md:block bg-gray-50/50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Left spacer for perfect flexbox centering */}
            <div className="flex-1"></div>

            {/* Centered Navigation */}
            <nav className="flex flex-wrap justify-center items-center gap-x-6 xl:gap-x-8 gap-y-2 shrink-0">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-gray-600 hover:text-primary-green font-medium transition-colors relative group whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-green transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </nav>

            {/* Right Tools - Now part of normal flow to prevent overlap */}
            <div className="flex-1 flex justify-end items-center gap-5">
              {isAuthenticated && (
                <>
                  <NotificationBell />
                  <Link
                    to="/chat"
                    className="relative text-gray-500 hover:text-primary-green transition-colors p-1"
                    aria-label="Messages"
                  >
                    <svg
                      className="w-5 h-5"
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
                    {displayUnreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                        {displayUnreadChatCount > 9
                          ? "9+"
                          : displayUnreadChatCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden py-4 border-t border-gray-100 bg-white shadow-inner animate-fade-up">
          <div className="container mx-auto px-4">
            {/* Mobile Auth Actions */}
            <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-gray-100">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green to-medium-green text-white flex items-center justify-center font-bold">
                      {user?.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {staffLink ? (
                      <Link
                        to={staffLink.to}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-green flex items-center justify-center gap-2 shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={staffLink.icon}
                          />
                        </svg>
                        {staffLink.label}
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-green text-center shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-green shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-3 rounded-xl text-sm text-gray-700 hover:text-primary-green hover:bg-green-50 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <Link
                    to="/notifications"
                    className="px-4 py-3 rounded-xl text-sm text-gray-700 hover:text-primary-green hover:bg-green-50 font-medium transition-colors flex items-center justify-between"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                    </div>
                  </Link>
                  <Link
                    to="/chat"
                    className="px-4 py-3 rounded-xl text-sm text-gray-700 hover:text-primary-green hover:bg-green-50 font-medium transition-colors flex items-center justify-between"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                    </div>
                    {displayUnreadChatCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-sm">
                        {displayUnreadChatCount > 9
                          ? "9+"
                          : displayUnreadChatCount}
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
  );
};

export default Header;
