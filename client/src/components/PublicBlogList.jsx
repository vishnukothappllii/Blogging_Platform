"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Calendar, User, Heart, MessageCircle, Eye } from "lucide-react"
import { useLike } from "../contexts/LikeContext"
import axios from "axios"

const PublicBlogList = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const { likeStatus, toggleBlogLike, checkLikeStatus, loading: likeLoading } = useLike()

  useEffect(() => {
    fetchPublicBlogs()
  }, [currentPage, searchTerm, selectedCategory])

  // Check like status for blogs when they load
  useEffect(() => {
    if (blogs.length > 0) {
      blogs.forEach((blog) => {
        checkLikeStatus(blog._id, "blog")
      })
    }
  }, [blogs])

  const fetchPublicBlogs = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/v1/blogs/public", {
        params: {
          page: currentPage,
          limit: 12,
          search: searchTerm,
          category: selectedCategory,
        },
      })
      setBlogs(response.data.data.docs || [])
      setTotalPages(response.data.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (blogId, e) => {
    e.preventDefault() // Prevent navigation when clicking like button
    await toggleBlogLike(blogId)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Categories</option>
          <option value="technology">Technology</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="travel">Travel</option>
          <option value="food">Food</option>
          <option value="business">Business</option>
        </select>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="bg-white rounded-lg shadow-md border border-gray-200 group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={blog.thumbnail || "/placeholder.svg?height=200&width=400"}
                alt={blog.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {blog.category && (
                <span className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors duration-200">
                  {blog.category}
                </span>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 mb-3">
                <Link to={`/blog/${blog.slug || blog._id}`} className="hover:underline">
                  {blog.title}
                </Link>
              </h3>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{blog.author?.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </div>

              <p className="text-gray-700 line-clamp-3 mb-4">
                {blog.description || blog.content?.substring(0, 150) + "..."}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button
                    onClick={(e) => handleLike(blog._id, e)}
                    disabled={likeLoading}
                    className={`flex items-center gap-1 hover:text-red-500 transition-colors duration-200 disabled:opacity-50 ${
                      likeStatus[blog._id] ? "text-red-500" : ""
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likeStatus[blog._id] ? "fill-current" : ""}`} />
                    <span>{blog.likesCount || 0}</span>
                  </button>
                  <div className="flex items-center gap-1 hover:text-blue-500 transition-colors duration-200">
                    <MessageCircle className="w-4 h-4" />
                    <span>{blog.commentCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-green-500 transition-colors duration-200">
                    <Eye className="w-4 h-4" />
                    <span>{blog.views || 0}</span>
                  </div>
                </div>

                <Link
                  to={`/blog/${blog.slug || blog._id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i
              if (pageNum > totalPages) return null

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PublicBlogList
