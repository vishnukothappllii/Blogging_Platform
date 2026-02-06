import { createContext, useContext, useState } from "react"
import axios from "axios"
import { useToast } from "../components/ui/use-toast"

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [users, setUsers] = useState([])
  const [userDetails, setUserDetails] = useState(null)
  const [platformStats, setPlatformStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const getAllUsers = async (params = {}) => {
    try {
      setLoading(true)
      setError(null)

      const { page = 1, limit = 20, role, status, search } = params

      const response = await axios.get("${import.meta.env.VITE_API_URL}/api/v1/admin/users", {
        params: {
          page,
          limit,
          role,
          status,
          search,
        },
      })

      setUsers(response.data.data.docs || [])
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch users",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUserById = async (userId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}`)

      setUserDetails(response.data.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch user details")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch user details",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId, updateData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}`, updateData)

      // Update in users list if exists
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, ...response.data.data, updatedAt: new Date().toISOString() } : user,
        ),
      )

      // Update user details if currently viewed
      if (userDetails?._id === userId) {
        setUserDetails(response.data.data)
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}/status`)

      // Update in users list
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, ...response.data.data, updatedAt: new Date().toISOString() } : user,
        ),
      )

      // Update user details if currently viewed
      if (userDetails?._id === userId) {
        setUserDetails(response.data.data)
      }

      toast({
        title: "Success",
        description: "User status updated",
      })

      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to toggle user status")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle user status",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}`)

      // Remove from users list
      setUsers((prev) => prev.filter((user) => user._id !== userId))

      // Clear user details if currently viewed
      if (userDetails?._id === userId) {
        setUserDetails(null)
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getPlatformStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get("${import.meta.env.VITE_API_URL}/api/v1/admin/stats")

      setPlatformStats(response.data.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch platform stats")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch platform stats",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getRecentActivity = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get("${import.meta.env.VITE_API_URL}/api/v1/admin/activity")

      setRecentActivity(response.data.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch recent activity")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch recent activity",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (searchQuery, page = 1, limit = 20) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get("${import.meta.env.VITE_API_URL}/api/v1/admin/users", {
        params: {
          search: searchQuery,
          page,
          limit,
        },
      })

      setUsers(response.data.data.docs || [])
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to search users")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to search users",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
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
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
