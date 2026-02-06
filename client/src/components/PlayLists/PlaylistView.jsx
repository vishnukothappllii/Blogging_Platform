import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Search, X } from "lucide-react"
import { usePlaylist } from "../../contexts/PlaylistContext"
import { useBlog } from "../../contexts/BlogContext"

export function PlaylistView({ playlist, onBack }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [availableBlogs, setAvailableBlogs] = useState([])
  const [showAddBlog, setShowAddBlog] = useState(false)

  const { currentPlaylist, getPlaylistById, addBlogToPlaylist, removeBlogFromPlaylist, loading } = usePlaylist()
  const { blogs, getAllBlogs, loading: blogLoading } = useBlog()

  useEffect(() => {
    if (playlist?._id) {
      getPlaylistById(playlist._id)
    }
  }, [playlist?._id])

  // Fetch all blogs for the "Add Blog" functionality
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        await getAllBlogs()
      } catch (error) {
        console.error("Failed to fetch blogs:", error)
      }
    }
    fetchBlogs()
  }, [])

  // Set available blogs from the blog context
  useEffect(() => {
    setAvailableBlogs(blogs)
  }, [blogs])

  const handleAddBlog = async (blogId) => {
    try {
      await addBlogToPlaylist(playlist._id, blogId)
      setShowAddBlog(false)
    } catch (error) {
      console.error("Failed to add blog:", error)
    }
  }

  const handleRemoveBlog = async (blogId) => {
    if (window.confirm("Remove this blog from the playlist?")) {
      try {
        await removeBlogFromPlaylist(playlist._id, blogId)
      } catch (error) {
        console.error("Failed to remove blog:", error)
      }
    }
  }

  const filteredBlogs = availableBlogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !currentPlaylist?.blogs?.some((playlistBlog) => {
        const blogId = typeof playlistBlog === "object" ? playlistBlog._id : playlistBlog
        return blogId === blog._id
      }),
  )

  if ((loading && !currentPlaylist) || blogLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Playlists
        </button>
      </div>

      {/* Playlist Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          {currentPlaylist?.coverImage ? (
            <img
              src={currentPlaylist.coverImage || "/placeholder.svg"}
              alt={currentPlaylist.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{currentPlaylist?.name?.charAt(0).toUpperCase()}</span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{currentPlaylist?.name}</h1>
            <p className="text-gray-600 mb-4">{currentPlaylist?.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{currentPlaylist?.blogs?.length || 0} blogs</span>
              <span>{currentPlaylist?.isPublic ? "Public" : "Private"}</span>
              <span>Created by {currentPlaylist?.owner?.name}</span>
            </div>
          </div>

          <button
            onClick={() => setShowAddBlog(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Blog
          </button>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPlaylist?.blogs?.map((blog) => {
          // Handle both populated blog objects and blog IDs
          const blogData = typeof blog === "object" ? blog : blogs.find((b) => b._id === blog)

          if (!blogData) return null

          return (
            <div key={blogData._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={blogData.thumbnail || "/placeholder.svg?height=200&width=300"}
                alt={blogData.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{blogData.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {blogData.description || blogData.content?.substring(0, 100) + "..."}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={blogData.author?.avatar || "/placeholder.svg?height=24&width=24"}
                      alt={blogData.author?.name || blogData.author?.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{blogData.author?.name || blogData.author?.username}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{blogData.views || 0} views</span>
                    <button
                      onClick={() => handleRemoveBlog(blogData._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {currentPlaylist?.blogs?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blogs in this playlist yet</p>
          <button
            onClick={() => setShowAddBlog(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First Blog
          </button>
        </div>
      )}

      {/* Add Blog Modal */}
      {showAddBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Blog to Playlist</h2>
              <button onClick={() => setShowAddBlog(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredBlogs.map((blog) => (
                <div key={blog._id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                  <img
                    src={blog.thumbnail || "/placeholder.svg?height=64&width=64"}
                    alt={blog.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{blog.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {blog.description || blog.content?.substring(0, 100)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{blog.author?.name || blog.author?.username}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{blog.views || 0} views</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBlog(blog._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>

            {filteredBlogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No blogs found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
