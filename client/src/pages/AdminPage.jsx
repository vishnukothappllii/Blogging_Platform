import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../components/ui/use-toast"
import {
  Users,
  Trash2,
  Shield,
  Search,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Edit,
  User,
  Activity,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAdmin } from "../contexts/AdminContext"

const AdminPage = () => {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [togglingUserId, setTogglingUserId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [activeTab, setActiveTab] = useState("users")
  const limit = 10

  const {
    users,
    userDetails,
    platformStats,
    recentActivity,
    loading,
    error,
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getPlatformStats,
    getRecentActivity,
    searchUsers,
    setUserDetails,
  } = useAdmin()

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        await getPlatformStats()
        await getRecentActivity()
        await fetchUsers()
      } catch (error) {
        showError("Failed to load admin data")
      }
    }

    fetchAdminData()
  }, [])

  // Cleanup function to clear user details when component unmounts
  useEffect(() => {
    return () => {
      setUserDetails(null)
    }
  }, [setUserDetails])

  const fetchUsers = async () => {
    try {
      await getAllUsers({ page, limit, status: "active" })
    } catch (error) {
      showError("Failed to fetch users")
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      setPage(1)
      // Clear user details when performing search
      setUserDetails(null)
      if (activeTab === "userDetails") {
        setActiveTab("users")
      }
      await searchUsers(searchQuery, 1, limit)
    } catch (error) {
      showError("Search failed")
    }
  }

  const handlePageChange = async (newPage) => {
    if (newPage < 1) return
    setPage(newPage)

    // Clear user details when changing pages
    setUserDetails(null)
    if (activeTab === "userDetails") {
      setActiveTab("users")
    }

    if (searchQuery) {
      await searchUsers(searchQuery, newPage, limit)
    } else {
      await getAllUsers({ page: newPage, limit })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      showError("You cannot delete your own account.")
      return
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingUserId(userId)
      await deleteUser(userId)

      // Clear user details if we deleted the currently viewed user
      if (userDetails && userDetails._id === userId) {
        setUserDetails(null)
        setActiveTab("users")
      }

      // Refresh platform stats after deletion
      await getPlatformStats()

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
    } catch (error) {
      showError(error.message || "Failed to delete user")
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      setTogglingUserId(userId)
      await toggleUserStatus(userId)

      // Update user details if we're currently viewing this user
      if (userDetails && userDetails._id === userId) {
        const updatedUser = users.find((user) => user._id === userId)
        if (updatedUser) {
          setUserDetails(updatedUser)
        }
      }

      // Refresh platform stats after status change
      await getPlatformStats()

      toast({
        title: "Success",
        description: "User status updated",
      })
    } catch (error) {
      showError(error.message || "Failed to update user status")
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleViewUserDetails = async (userId) => {
    try {
      await getUserById(userId)
      setActiveTab("userDetails")
    } catch (error) {
      showError("Failed to load user details")
    }
  }

  const handleEditUser = (user) => {
    setEditForm({
      _id: user._id,
      fullName: user.fullName || "",
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setIsEditing(true)
  }

  const handleSaveUser = async () => {
    try {
      const updateData = {
        fullName: editForm.fullName,
        role: editForm.role,
        status: editForm.status,
      }

      const response = await updateUser(editForm._id, updateData)

      // Update user details if we're currently viewing this user
      if (userDetails && userDetails._id === editForm._id) {
        setUserDetails(response.data)
      }

      // Refresh platform stats after update
      await getPlatformStats()

      setIsEditing(false)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error) {
      showError("Failed to update user")
    }
  }

  const handleTabChange = (newTab) => {
    // Clear user details when switching away from userDetails tab
    if (activeTab === "userDetails" && newTab !== "userDetails") {
      setUserDetails(null)
    }
    setActiveTab(newTab)
  }

  const handleBackToUsers = () => {
    setUserDetails(null)
    setActiveTab("users")
  }

  const handleRefresh = async () => {
    // Clear user details on refresh
    setUserDetails(null)
    if (activeTab === "userDetails") {
      setActiveTab("users")
    }

    await getPlatformStats()
    await getRecentActivity()
    await fetchUsers()
  }

  const showError = (message) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatActivityType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading && page === 1 && !searchQuery) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-600 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-white">
                  <Shield className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Manage users and system settings</p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Enhanced Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Users</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {platformStats?.users?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">All registered users</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Users</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {platformStats?.users?.admins || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Users with admin role</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Users</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {platformStats?.users?.active || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Currently active users</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Users</h3>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {platformStats?.users?.new || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === "users" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
              onClick={() => handleTabChange("users")}
            >
              User Management
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === "activity" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
              onClick={() => handleTabChange("activity")}
            >
              Recent Activity
            </button>
            {activeTab === "userDetails" && userDetails && (
              <button
                className={`py-2 px-4 font-medium text-sm flex items-center text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400`}
              >
                <User className="h-4 w-4 mr-2" />
                User Details
              </button>
            )}
          </div>

          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>

                <form onSubmit={handleSearch} className="w-full md:w-auto flex">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Updated At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((userItem) => (
                      <tr
                        key={userItem._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleViewUserDetails(userItem._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              {userItem.avatar?.url ? (
                                <img
                                  src={userItem.avatar.url || "/placeholder.svg"}
                                  alt={userItem.fullName || userItem.username}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none"
                                    e.target.nextSibling.style.display = "flex"
                                  }}
                                />
                              ) : null}
                              <span
                                className={`text-blue-600 dark:text-blue-400 font-medium ${userItem.avatar?.url ? "hidden" : "block"}`}
                                style={{ display: userItem.avatar?.url ? "none" : "flex" }}
                              >
                                {userItem.fullName
                                  ? userItem.fullName.charAt(0).toUpperCase()
                                  : userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {userItem.fullName || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {userItem.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.role === "admin"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            }`}
                          >
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleStatus(userItem._id)
                            }}
                            disabled={togglingUserId === userItem._id || userItem._id === currentUser?.id}
                            className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              userItem.status === "active"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            } ${
                              togglingUserId === userItem._id || userItem._id === currentUser?.id
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:opacity-80"
                            }`}
                          >
                            {userItem.status === "active" ? (
                              <ToggleRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 mr-1" />
                            )}
                            {userItem.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {formatDate(userItem.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {formatDate(userItem.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditUser(userItem)
                            }}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteUser(userItem._id)
                            }}
                            disabled={deletingUserId === userItem._id || userItem._id === currentUser?.id}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                              deletingUserId === userItem._id || userItem._id === currentUser?.id
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                            }`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingUserId === userItem._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No users found.</p>
                  </div>
                )}

                {loading && users.length === 0 && (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    page === 1
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>

                <span className="text-gray-700 dark:text-gray-300">Page {page}</span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={users.length < limit}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    users.length < limit
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Track recent actions on the platform</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentActivity?.map((activity) => (
                      <tr key={activity._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              {activity.user?.avatar?.url ? (
                                <img
                                  src={activity.user.avatar.url || "/placeholder.svg"}
                                  alt={activity.user?.username || "System"}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none"
                                    e.target.nextSibling.style.display = "flex"
                                  }}
                                />
                              ) : null}
                              <span
                                className={`text-blue-600 dark:text-blue-400 font-medium ${activity.user?.avatar?.url ? "hidden" : "flex"}`}
                                style={{ display: activity.user?.avatar?.url ? "none" : "flex" }}
                              >
                                {activity.user?.username?.charAt(0).toUpperCase() || "S"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.user?.username || "System"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                            {formatActivityType(activity.actionType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{activity.details}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {formatDate(activity.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!recentActivity || recentActivity.length === 0) && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
                  </div>
                )}

                {loading && (!recentActivity || recentActivity.length === 0) && (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Details Tab */}
          {activeTab === "userDetails" && userDetails && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                  User Details
                </h2>
                <button
                  onClick={handleBackToUsers}
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back to Users
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <div className="flex flex-col items-center">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                        {userDetails.avatar?.url ? (
                          <img
                            src={userDetails.avatar.url || "/placeholder.svg"}
                            alt={userDetails.fullName || userDetails.username}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none"
                              e.target.nextSibling.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-3xl text-blue-600 dark:text-blue-400 font-medium ${userDetails.avatar?.url ? "hidden" : "flex"}`}
                          style={{ display: userDetails.avatar?.url ? "none" : "flex" }}
                        >
                          {userDetails.fullName
                            ? userDetails.fullName.charAt(0).toUpperCase()
                            : userDetails.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {userDetails.fullName || userDetails.username}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">@{userDetails.username}</p>

                      <div className="flex gap-2 mb-6">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            userDetails.role === "admin"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          }`}
                        >
                          {userDetails.role}
                        </span>
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            userDetails.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {userDetails.status}
                        </span>
                      </div>

                      <button
                        onClick={() => handleEditUser(userDetails)}
                        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit className="h-5 w-5 mr-2" />
                        Edit User
                      </button>
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h4>
                        <p className="text-gray-900 dark:text-white">{userDetails.email}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</h4>
                        <p className="text-gray-900 dark:text-white">{formatDate(userDetails.createdAt)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</h4>
                        <p className="text-gray-900 dark:text-white">{formatDate(userDetails.updatedAt)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Watch History</h4>
                        <p className="text-gray-900 dark:text-white">{userDetails.watchHistory?.length || 0} items</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Activity</h4>
                      <div className="space-y-3">
                        {userDetails.recentActivity?.slice(0, 3).map((activity, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {(!userDetails.recentActivity || userDetails.recentActivity.length === 0) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Edit User Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username cannot be changed</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUser}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminPage
