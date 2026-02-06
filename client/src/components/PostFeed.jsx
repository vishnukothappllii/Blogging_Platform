"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { usePost } from "../contexts/PostContext"
import { useLike } from "../contexts/LikeContext"
import { useFollower } from "../contexts/FollowerContext"

const PostFeed = () => {
  const { user } = useAuth()
  const { feed, loading, getFeed, updatePost, deletePost } = usePost()
  const { toggleBlogLike, likeStatus, loading: likeLoading, error: likeError, checkLikeStatus } = useLike()
  const { toggleFollow, followStatus } = useFollower()

  const [editingPost, setEditingPost] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    getFeed()
  }, [])

  // Check like status for posts when feed loads
  useEffect(() => {
    if (feed.length > 0 && user) {
      feed.forEach((post) => {
        checkLikeStatus(post._id, "blog")
      })
    }
  }, [feed, user])

  const handleLike = async (postId) => {
    if (!user) {
      alert("Please sign in to like posts")
      return
    }

    await toggleBlogLike(postId)
  }

  const handleFollow = async (authorId) => {
    if (!user || user._id === authorId) return
    await toggleFollow(authorId)
  }

  const handleEdit = (post) => {
    setEditingPost(post._id)
    setEditContent(post.content)
    setOpenDropdown(null)
  }

  const handleSaveEdit = async (postId) => {
    try {
      await updatePost(postId, editContent)
      setEditingPost(null)
      setEditContent("")
    } catch (error) {
      console.error("Error updating post:", error)
    }
  }

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId)
        setOpenDropdown(null)
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.owner.name}`,
          text: post.content,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatDate = (dateString) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return postDate.toLocaleDateString()
  }

  const extractHashtags = (content) => {
    const hashtags = content.match(/#\w+/g) || []
    return hashtags
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 animate-pulse">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {likeError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Like Error:</strong> {likeError}
          </p>
        </div>
      )}

      {feed.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={post.owner?.avatar || "/placeholder.svg"}
                    alt={post.owner?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm hidden">
                    {post.owner?.name?.charAt(0)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{post.owner?.name}</h3>
                    {user && user._id !== post.owner._id && (
                      <button
                        onClick={() => handleFollow(post.owner._id)}
                        className={`h-6 px-2 text-xs rounded-md font-medium transition-all duration-200 ${
                          followStatus[post.owner._id]
                            ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {followStatus[post.owner._id] ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    @{post.owner?.username} • {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              {user && user._id === post.owner._id && (
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openDropdown === post._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                        <button
                          onClick={() => handleEdit(post)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6">
            {editingPost === post._id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="What's on your mind?"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(post._id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingPost(null)
                      setEditContent("")
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

                  {/* Hashtags */}
                  {extractHashtags(post.content).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {extractHashtags(post.content).map((hashtag, index) => (
                        <span
                          key={index}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Media */}
                {post.media && (
                  <div className="mb-4">
                    {post.media.includes("video") ? (
                      <video src={post.media} controls className="w-full max-h-96 rounded-lg shadow-sm" />
                    ) : (
                      <img
                        src={post.media || "/placeholder.svg"}
                        alt="Post media"
                        className="w-full max-h-96 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      disabled={likeLoading}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                        likeStatus[post._id]
                          ? "text-red-600 bg-red-50 hover:bg-red-100"
                          : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likeStatus[post._id] ? "fill-current" : ""}`} />
                      {post.likesCount || 0}
                    </button>

                    <button className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                      <MessageCircle className="w-4 h-4" />
                      {post.commentCount || 0}
                    </button>

                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {feed.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No posts in your feed yet.</p>
            <p className="text-sm text-gray-500">Follow some users to see their posts here!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostFeed
