"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Moon, Sun, Menu, X, BookmarkIcon, Users } from "lucide-react"
import logo from "../../photos/BloggingLogo.jpg"

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const buttonBase = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
  const buttonGhost = `${buttonBase} bg-transparent hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:text-white dark:hover:text-red-500`
  const buttonSolid = `${buttonBase} bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600`
  const buttonIcon = "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"

  return (
    <header className="border-t border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-800 transition-colors duration-200">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <img src={logo || "/placeholder.svg"} className="h-14 mt-1 sm:h-13 mr-2 sm:mr-3 dark:invert" alt="Logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/blogs"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
          >
            Explore Blogs
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/feed"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Feed
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                to="/blog/new"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Write
              </Link>
              <Link
                to="/playlists"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
              >
                <BookmarkIcon className="w-4 h-4" />
                Playlists
              </Link>
              <Link
                to={`/profile/${user?._id}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              <button className={buttonGhost} onClick={logout}>
                Logout
              </button>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Hi, {user?.username || "User"}</span>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link to="/signup">
                <button className={buttonSolid}>Sign Up</button>
              </Link>
            </>
          )}
          <button className={buttonIcon} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button className={buttonIcon} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <button className={buttonIcon} onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? (
              <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/blogs"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
              onClick={toggleMenu}
            >
              Explore Blogs
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/feed"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
                  onClick={toggleMenu}
                >
                  <Users className="w-4 h-4" />
                  Feed
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/blog/new"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Write
                </Link>
                <Link
                  to="/playlists"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
                  onClick={toggleMenu}
                >
                  <BookmarkIcon className="w-4 h-4" />
                  Playlists
                </Link>
                <Link
                  to={`/profile/${user?._id}`}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    Admin
                  </Link>
                )}
                <button
                  className={buttonGhost}
                  onClick={() => {
                    logout()
                    toggleMenu()
                  }}
                >
                  Logout
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Hi, {user?.username || "User"}
                </span>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Sign In
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <button className={buttonSolid}>Sign Up</button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
