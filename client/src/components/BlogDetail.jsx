import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Calendar, Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useLike } from "../contexts/LikeContext"
import { useComment } from "../contexts/CommentContext"
import { useFollower } from "../contexts/FollowerContext"
import CommentSection from "./CommentSection"
import axios from "axios"

const BlogDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { toggleBlogLike, checkLikeStatus, likeStatus } = useLike()
  const { getBlogComments } = useComment()
  const { toggleFollow, checkFollowStatus, followStatus } = useFollower()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedBlogs, setRelatedBlogs] = useState([])

  useEffect(() => {
    fetchBlogDetail()
    fetchRelatedBlogs()
  }, [id])

  useEffect(() => {
    if (blog && user) {
      checkLikeStatus(blog._id, "blog")
      checkFollowStatus(blog.author._id)
    }
  }, [blog, user])

  const fetchBlogDetail = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/v1/blogs/${id}`)
      setBlog(response.data.data)

      // Increment view count
      await axios.post(`/api/v1/blogs/${id}/view`)
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedBlogs = async () => {
    try {
      const response = await axios.get(`/api/v1/blogs/${id}/related`)
      setRelatedBlogs(response.data.data || [])
    } catch (error) {
      console.error("Error fetching related blogs:", error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }
    await toggleBlogLike(blog._id)
  }

  const handleFollow = async () => {
    if (!user) {
      return
    }
    await toggleFollow(blog.author._id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Blog Header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={blog.author?.avatar || "/placeholder.svg?height=40&width=40"}
              alt={blog.author?.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/profile/${blog.author._id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                  {blog.author?.name}
                </Link>
                {user && user._id !== blog.author._id && (
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      followStatus[blog.author._id]
                        ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={handleFollow}
                  >
                    {followStatus[blog.author._id] ? "Following" : "Follow"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
                <span>•</span>
                <span>{blog.readTime || "5"} min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border transition-colors ${
                likeStatus[blog._id]
                  ? "text-red-600 border-red-600 bg-red-50 hover:bg-red-100"
                  : "text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 mr-1 ${likeStatus[blog._id] ? "fill-current" : ""}`} />
              {blog.likesCount || 0}
            </button>

            <button
              className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </button>

            {user && (
              <button className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {blog.thumbnail && (
          <img
            src={blog.thumbnail || "/placeholder.svg"}
            alt={blog.title}
            className="w-full h-64 sm:h-96 object-cover rounded-lg mb-6"
          />
        )}
      </header>

      {/* Blog Content */}
      <article className="prose prose-lg max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>

      {/* Blog Footer */}
      <footer className="border-t pt-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{blog.likesCount || 0} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{blog.commentCount || 0} comments</span>
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={blog.author?.avatar || "/placeholder.svg?height=60&width=60"}
              alt={blog.author?.name}
              className="w-15 h-15 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{blog.author?.name}</h3>
              <p className="text-gray-600 mb-3">
                {blog.author?.bio || "Passionate writer and blogger sharing insights on various topics."}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{blog.author?.followersCount || 0} followers</span>
                <span>{blog.author?.blogsCount || 0} articles</span>
              </div>
            </div>
            {user && user._id !== blog.author._id && (
              <button
                className={`px-4 py-2 font-medium rounded-md transition-colors ${
                  followStatus[blog.author._id]
                    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={handleFollow}
              >
                {followStatus[blog.author._id] ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Comments Section */}
      <CommentSection blogId={blog._id} />

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog) => (
              <div key={relatedBlog._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                <div className="relative overflow-hidden">
                  <img
                    src={relatedBlog.thumbnail || "/placeholder.svg?height=150&width=300"}
                    alt={relatedBlog.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${relatedBlog.slug || relatedBlog._id}`}>{relatedBlog.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{relatedBlog.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{relatedBlog.author?.name}</span>
                    <span>{formatDate(relatedBlog.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogDetail