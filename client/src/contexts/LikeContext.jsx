"use client"

import { createContext, useContext, useState } from "react"
import axios from "axios"

const LikeContext = createContext()

export function LikeProvider({ children }) {
  const [likedBlogs, setLikedBlogs] = useState([])
  const [likedComments, setLikedComments] = useState([])
  const [likeStatus, setLikeStatus] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const showToast = (message, type = "success") => {
    // Simple toast implementation - you can replace with your preferred toast library
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const toggleBlogLike = async (blogId) => {
    try {
      setLoading(true)
      setError(null)

      // Optimistic update
      const currentStatus = likeStatus[blogId] || false
      setLikeStatus((prev) => ({
        ...prev,
        [blogId]: !currentStatus,
      }))

      const response = await axios.post(`/api/v1/likes/blog/${blogId}`)

      // Update with actual response
      setLikeStatus((prev) => ({
        ...prev,
        [blogId]: response.data.data?.isLiked ?? !currentStatus,
      }))

      showToast(response.data.message || "Like status updated")
      return response.data
    } catch (error) {
      // Revert optimistic update on error
      setLikeStatus((prev) => ({
        ...prev,
        [blogId]: likeStatus[blogId] || false,
      }))

      const errorMessage = error.response?.data?.message || "Failed to toggle like"
      setError(errorMessage)
      showToast(errorMessage, "error")

      // Don't throw error to prevent UI crashes
      console.error("Like toggle error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCommentLike = async (commentId) => {
    try {
      setLoading(true)
      setError(null)

      // Optimistic update
      const currentStatus = likeStatus[commentId] || false
      setLikeStatus((prev) => ({
        ...prev,
        [commentId]: !currentStatus,
      }))

      const response = await axios.post(`/api/v1/likes/comment/${commentId}`)

      // Update with actual response
      setLikeStatus((prev) => ({
        ...prev,
        [commentId]: response.data.data?.isLiked ?? !currentStatus,
      }))

      showToast(response.data.message || "Like status updated")
      return response.data
    } catch (error) {
      // Revert optimistic update on error
      setLikeStatus((prev) => ({
        ...prev,
        [commentId]: likeStatus[commentId] || false,
      }))

      const errorMessage = error.response?.data?.message || "Failed to toggle like"
      setError(errorMessage)
      showToast(errorMessage, "error")
      console.error("Comment like toggle error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLikedBlogs = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get("/api/v1/likes/blogs", {
        params: { page, limit },
      })

      const blogs = response.data.data?.docs || []
      setLikedBlogs(blogs)

      // Update like status for fetched blogs
      const statusUpdates = {}
      blogs.forEach((blog) => {
        statusUpdates[blog._id] = true
      })
      setLikeStatus((prev) => ({ ...prev, ...statusUpdates }))

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch liked blogs"
      setError(errorMessage)
      showToast(errorMessage, "error")
      console.error("Get liked blogs error:", error)
      return { data: { docs: [] } }
    } finally {
      setLoading(false)
    }
  }

  const getLikedComments = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get("/api/v1/likes/comments", {
        params: { page, limit },
      })

      const comments = response.data.data?.docs || []
      setLikedComments(comments)

      // Update like status for fetched comments
      const statusUpdates = {}
      comments.forEach((comment) => {
        statusUpdates[comment._id] = true
      })
      setLikeStatus((prev) => ({ ...prev, ...statusUpdates }))

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch liked comments"
      setError(errorMessage)
      showToast(errorMessage, "error")
      console.error("Get liked comments error:", error)
      return { data: { docs: [] } }
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async (targetId, type) => {
    try {
      const response = await axios.get(`/api/v1/likes/status/${type}/${targetId}`)

      setLikeStatus((prev) => ({
        ...prev,
        [targetId]: response.data.data?.isLiked || false,
      }))

      return response.data
    } catch (error) {
      console.error("Check like status error:", error)
      // Don't show error toast for status checks as they're background operations
      return { data: { isLiked: false } }
    }
  }

  const value = {
    likedBlogs,
    likedComments,
    likeStatus,
    loading,
    error,
    toggleBlogLike,
    toggleCommentLike,
    getLikedBlogs,
    getLikedComments,
    checkLikeStatus,
  }

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>
}

export function useLike() {
  const context = useContext(LikeContext)
  if (context === undefined) {
    throw new Error("useLike must be used within a LikeProvider")
  }
  return context
}
