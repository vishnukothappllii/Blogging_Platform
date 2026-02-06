import { Routes, Route, useLocation } from "react-router-dom"

// Pages
import HomePage from "./pages/HomePage"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import VerifyOtpPage from "./pages/VerifyOtpPage"
import NotFoundPage from "./pages/NotFoundPage"
import BlogEditor from "./pages/BlogEditor"
import Layout from "./Layout.jsx"

// New Blog Pages
import PublicBlogsPage from "./pages/PublicBlogsPage"
import BlogDetailPage from "./pages/BlogDetailPage"
import UserProfilePage from "./pages/UserProfilePage"
import SocialFeedPage from "./pages/SocialFeedPage"
import HashtagPage from "./pages/HashtagPage"

// Protecting routes
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import AdminPage from "./pages/AdminPage"

// Context Providers
import { BlogProvider } from "./contexts/BlogContext"
import { DashboardProvider } from "./contexts/DashboardContext"
import { AdminProvider } from "./contexts/AdminContext"
import { PlaylistProvider } from "./contexts/PlaylistContext"

// Dashboard Layout Pages
import Settings from "./pages/Settings/Settings"
import Dashboard from "./pages/Dashboard/Dashboard"
import PlaylistPage from "./pages/PlaylistPage"

function App() {
  const location = useLocation()

  return (
    <Routes location={location}>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route path="" element={<HomePage />} />
        <Route path="/blogs" element={<PublicBlogsPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/hashtag/:hashtag" element={<HashtagPage />} />

        {/* Authentication Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* Protected Routes */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <SocialFeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <BlogProvider>
                <DashboardProvider>
                  <Dashboard />
                </DashboardProvider>
              </BlogProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <PlaylistProvider>
                <PlaylistPage />
              </PlaylistProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/new"
          element={
            <ProtectedRoute>
              <BlogProvider>
                <BlogEditor />
              </BlogProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/edit/:blogId"
          element={
            <ProtectedRoute>
              <BlogProvider>
                <BlogEditor />
              </BlogProvider>
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminProvider>
                <AdminPage />
              </AdminProvider>
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
