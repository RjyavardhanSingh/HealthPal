"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate, NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// Custom CSS for the redesigned UI
const customStyles = `
  /* Base animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  /* Animation classes */
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-slide-down {
    animation: slideDown 0.3s ease-out forwards;
  }
  
  /* Custom UI elements */
  .navbar-shadow {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .search-input {
    transition: all 0.2s ease;
  }
  
  .search-input:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  
  .nav-dropdown {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .nav-dropdown-item {
    transition: all 0.2s ease;
  }
  
  .nav-dropdown-item:hover {
    background-color: #f3f4f6;
  }
  
  .mobile-nav-item {
    transition: all 0.2s ease;
  }
  
  .mobile-nav-item:hover {
    color: #3b82f6;
  }
  
  .mobile-nav-item.active {
    color: #3b82f6;
  }
  
  .mobile-nav-item.active svg {
    color: #3b82f6;
  }
  
  .logo-text {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  .notification-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background-color: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
  }
  
  .burger-button {
    transition: all 0.2s ease;
  }
  
  .burger-button:hover {
    background-color: #f3f4f6;
    color: #3b82f6;
  }
  
  .profile-button {
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }
  
  .profile-button:hover {
    border-color: #e5e7eb;
  }
  
  .profile-button:focus {
    border-color: #3b82f6;
  }
  
  .avatar-gradient {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
`

const NavBar = ({ toggleSidebar }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close menus when location changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
  }, [location])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  // Add search form submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Redirect to find doctor page with search query
    navigate("/find-doctor", {
      state: { searchTerm: searchQuery },
    })

    // Clear search field
    setSearchQuery("")
  }

  // Helper for active nav links
  const navLinkClass = ({ isActive }) => {
    return `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-white bg-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`
  }

  // Helper for mobile nav links
  const mobileNavLinkClass = ({ isActive }) => {
    return `mobile-nav-item flex flex-col items-center justify-center ${
      isActive ? "text-blue-600 active" : "text-gray-600"
    }`
  }

  return (
    <>
      {/* Add custom styles */}
      <style>{customStyles}</style>

      {/* Desktop top navigation */}
      <nav className="bg-white navbar-shadow fixed top-0 inset-x-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center">
            {/* Burger Menu Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="burger-button p-3 rounded-full text-gray-500 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center ml-2">
              <Link to="/" className="text-2xl font-bold logo-text">
                HealthPal
              </Link>
            </div>

            {/* Search Bar - Center aligned */}
            <div className="hidden md:flex flex-1 justify-center px-2 lg:px-0">
              <div className="w-full max-w-lg">
                <form onSubmit={handleSearchSubmit}>
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="search"
                      name="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Search for doctors, services, etc."
                      type="search"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center ml-auto space-x-4">
              {/* Notification bell */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="notification-badge"></span>
              </Link>

              {/* User Profile Menu */}
              {currentUser ? (
                <div className="ml-3 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="profile-button flex items-center space-x-2 bg-white rounded-full focus:outline-none"
                  >
                    {currentUser.photoURL ? (
                      <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
                        src={currentUser.photoURL || "/placeholder.svg"}
                        alt={currentUser.displayName || "User"}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full avatar-gradient flex items-center justify-center text-white shadow-sm border-2 border-white">
                        <span className="font-medium">{currentUser.displayName?.charAt(0) || "U"}</span>
                      </div>
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="nav-dropdown origin-top-right absolute right-0 mt-2 w-48 py-1 bg-white animate-slide-down z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{currentUser.displayName || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="nav-dropdown-item block px-4 py-2 text-sm text-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="nav-dropdown-item block px-4 py-2 text-sm text-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="nav-dropdown-item block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-md hover:bg-blue-50"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile search bar - shown on mobile only */}
      <div className="md:hidden fixed top-16 inset-x-0 z-40 px-4 py-2 bg-white border-b shadow-sm">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search for doctors, services..."
            />
          </div>
        </form>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 navbar-shadow md:hidden">
        <div className="grid grid-cols-5 h-16">
          <NavLink to="/home" className={mobileNavLinkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </NavLink>

          <NavLink to="/find-doctor" className={mobileNavLinkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-xs mt-1">Doctors</span>
          </NavLink>

          <NavLink to="/appointments" className={mobileNavLinkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs mt-1">Appts</span>
          </NavLink>

          <NavLink to="/notifications" className={mobileNavLinkClass}>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="notification-badge"></span>
            </div>
            <span className="text-xs mt-1">Alerts</span>
          </NavLink>

          <NavLink to="/profile" className={mobileNavLinkClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        </div>
      </div>
    </>
  )
}

export default NavBar

