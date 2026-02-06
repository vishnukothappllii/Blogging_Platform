"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Heart, Reply, Edit, Trash2, Send } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useComment } from "../contexts/CommentContext"
import { useLike } from "../contexts/LikeContext"

const CommentSection = ({ blogId }) => {
  const { user } = useAuth()
  const {
    comments,
    replies,
    loading,
    getBlogComments,
    addComment,
    updateComment,
    deleteComment,
    getReplies,
    addReply,
  } = useComment()
  const { toggleCommentLike, checkLikeStatus, likeStatus, loading: likeLoading } = useLike()

  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState("")
  const [showReplies, setShowReplies] = useState({})

  useEffect(() => {
    if (blogId) {
      getBlogComments(blogId)
    }
  }, [blogId])

  // Check like status for comments when they load
  useEffect(() => {
    if (comments.length > 0) {
      comments.forEach((comment) => {
        checkLikeStatus(comment._id, "comment")
      })
    }
  }, [comments])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await addComment(blogId, newComment)
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleAddReply = async (commentId) => {
    if (!replyText.trim() || !user) return

    try {
      await addReply(commentId, replyText)
      setReplyingTo(null)
      setReplyText("")
    } catch (error) {
      console.error("Error adding reply:", error)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return

    try {
      await updateComment(commentId, editText)
      setEditingComment(null)
      setEditText("")
    } catch (error) {
      console.error("Error updating comment:", error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(commentId)
      } catch (error) {
        console.error("Error deleting comment:", error)
      }
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!user) {
      alert("Please sign in to like comments")
      return
    }
    await toggleCommentLike(commentId)
  }

  const toggleReplies = async (commentId) => {
    if (showReplies[commentId]) {
      setShowReplies((prev) => ({ ...prev, [commentId]: false }))
    } else {
      await getReplies(commentId)
      setShowReplies((prev) => ({ ...prev, [commentId]: true }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={comment.owner?.avatar || "/placeholder.svg?height=32&width=32"}
              alt={comment.owner?.name}
              className="w-8 h-8 rounded-full"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">{comment.owner?.name}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                {comment.updatedAt !== comment.createdAt && <span className="text-xs text-gray-400">(edited)</span>}
              </div>

              {editingComment === comment._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your comment..."
                    className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null)
                        setEditText("")
                      }}
                      className="px-3 py-1 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-3">{comment.content}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  disabled={likeLoading}
                  className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                    likeStatus[comment._id] ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${likeStatus[comment._id] ? "fill-current" : ""}`} />
                  {comment.likesCount || 0}
                </button>

                {!isReply && user && (
                  <button
                    onClick={() => setReplyingTo(comment._id)}
                    className="inline-flex items-center text-sm font-medium text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                )}

                {user && user._id === comment.owner._id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment._id)
                        setEditText(comment.content)
                      }}
                      className="inline-flex items-center text-sm font-medium text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="inline-flex items-center text-sm font-medium text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment._id && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddReply(comment._id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText("")
                      }}
                      className="px-3 py-1 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show Replies Button */}
      {!isReply && comment.replyCount > 0 && (
        <button
          onClick={() => toggleReplies(comment._id)}
          className="inline-flex items-center text-sm font-medium text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors mb-4 ml-11"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          {showReplies[comment._id] ? "Hide" : "Show"} {comment.replyCount} replies
        </button>
      )}

      {/* Replies */}
      {showReplies[comment._id] &&
        replies.map((reply) => <CommentItem key={reply._id} comment={reply} isReply={true} />)}
    </div>
  )

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* Add Comment Form */}
      {user ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="p-4">
            <form onSubmit={handleAddComment} className="space-y-4">
              <div className="flex items-start gap-3">
                <img
                  src={user.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="p-4 text-center">
            <p className="text-gray-600 mb-4">Please sign in to leave a comment</p>
            <a
              href="/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment._id} comment={comment} />)
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CommentSection
