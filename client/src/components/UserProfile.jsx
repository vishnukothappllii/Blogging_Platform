import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Calendar, MapPin, Link, Users, FileText } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useFollower } from "../contexts/FollowerContext"
import { usePost } from "../contexts/PostContext"
import axios from "axios"

const UserProfile = () => {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const { toggleFollow, checkFollowStatus, followStatus, getFollowers, getFollowing } = useFollower()
  const { getUserPosts } = usePost()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userBlogs, setUserBlogs] = useState([])
  const [userPosts, setUserPosts] = useState([])
  const [activeTab, setActiveTab] = useState("posts")

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserContent()
    }
  }, [userId])

  useEffect(() => {
    if (user && currentUser && currentUser._id !== user._id) {
      checkFollowStatus(user._id)
    }
  }, [user, currentUser])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/v1/users/profile/${userId}`)
      setUser(response.data.data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserContent = async () => {
    try {
      // Fetch user's blogs
      const blogsResponse = await axios.get(`/api/v1/blogs/user/${userId}`)
      setUserBlogs(blogsResponse.data.data.docs || [])

      // Fetch user's posts
      const postsResponse = await getUserPosts(userId)
      setUserPosts(postsResponse.data.docs || [])
    } catch (error) {
      console.error("Error fetching user content:", error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || currentUser._id === user._id) return
    await toggleFollow(user._id)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image */}
      {user.coverImage && (
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 overflow-hidden">
          <img src={user.coverImage || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        {/* Avatar */}
        <div className="relative">
          <img 
            src={user.avatar || "/placeholder.svg"} 
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
          {!user.avatar && (
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.username}</p>
            </div>

            {currentUser && currentUser._id !== user._id && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto ${
                  followStatus[user._id] 
                    ? "bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500" 
                    : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-lg"
                }`}
              >
                {followStatus[user._id] ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {user.location && (
              <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {user.website}
                </a>
              </div>
            )}

            <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1 hover:text-gray-800 transition-colors cursor-pointer">
              <Users className="w-4 h-4" />
              <span>
                <strong>{user.followersCount || 0}</strong> followers
              </span>
            </div>
            <div className="flex items-center gap-1 hover:text-gray-800 transition-colors cursor-pointer">
              <Users className="w-4 h-4" />
              <span>
                <strong>{user.followingCount || 0}</strong> following
              </span>
            </div>
            <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              <FileText className="w-4 h-4" />
              <span>
                <strong>{userBlogs.length}</strong> articles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "posts"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Posts ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "blogs"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Articles ({userBlogs.length})
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "about"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            About
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="mt-6">
            {userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={user.avatar || "/placeholder.svg"} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {!user.avatar && (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
                            {user.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{user.name}</span>
                            <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-800 mb-3">{post.content}</p>
                          {post.media && (
                            <img
                              src={post.media || "/placeholder.svg"}
                              alt="Post media"
                              className="w-full max-h-64 object-cover rounded-lg mb-3 hover:opacity-95 transition-opacity cursor-pointer"
                            />
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="hover:text-red-500 cursor-pointer transition-colors">
                              ❤️ {post.likesCount || 0} likes
                            </span>
                            <span className="hover:text-blue-500 cursor-pointer transition-colors">
                              💬 {post.commentCount || 0} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-8 text-center">
                  <p className="text-gray-600">No posts yet.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="mt-6">
            {userBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userBlogs.map((blog) => (
                  <div key={blog._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img
                        src={blog.thumbnail || "/placeholder.svg?height=200&width=400"}
                        alt={blog.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">{blog.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{blog.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="hover:text-red-500 cursor-pointer transition-colors">
                            ❤️ {blog.likesCount || 0}
                          </span>
                          <span className="hover:text-blue-500 cursor-pointer transition-colors">
                            💬 {blog.commentCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-8 text-center">
                  <p className="text-gray-600">No articles published yet.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">About {user.name}</h2>
              </div>
              <div className="p-6 space-y-4">
                {user.bio ? (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Bio</h4>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No bio available.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Stats</h4>
                    <div className="space-y-1 text-sm">
                      <p className="hover:text-blue-600 transition-colors cursor-pointer">Articles: {userBlogs.length}</p>
                      <p className="hover:text-blue-600 transition-colors cursor-pointer">Posts: {userPosts.length}</p>
                      <p className="hover:text-blue-600 transition-colors cursor-pointer">Followers: {user.followersCount || 0}</p>
                      <p className="hover:text-blue-600 transition-colors cursor-pointer">Following: {user.followingCount || 0}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Member Since</h4>
                    <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile