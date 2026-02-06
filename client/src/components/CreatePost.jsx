import { useState } from "react"
import { Image, Video, Send, X } from "lucide-react"

const CreatePost = ({ onPostCreated }) => {
  // Mock user data since we don't have auth context
  const user = {
    name: "John Doe",
    avatar: null
  }

  const [content, setContent] = useState("")
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMediaSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMediaFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview({
          url: e.target.result,
          type: file.type.startsWith("video/") ? "video" : "image",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !mediaFile) return

    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset form
      setContent("")
      setMediaFile(null)
      setMediaPreview(null)
      setIsExpanded(false)

      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  const extractHashtags = (text) => {
    const hashtags = text.match(/#\w+/g) || []
    return hashtags
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 text-center">
          <p className="text-gray-600 mb-4">Please sign in to create posts</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4">
        <div onSubmit={handleSubmit}>
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name?.charAt(0) || "U"
              )}
            </div>

            <div className="flex-1">
              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className={`w-full border-none resize-none focus:outline-none focus:ring-0 p-0 text-gray-900 placeholder-gray-500 ${isExpanded ? "min-h-[120px]" : "min-h-[60px]"}`}
                onFocus={() => setIsExpanded(true)}
              />

              {/* Hashtag suggestions */}
              {content && extractHashtags(content).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {extractHashtags(content).map((hashtag, index) => (
                    <span key={index} className="text-blue-600 text-sm font-medium">
                      {hashtag}
                    </span>
                  ))}
                </div>
              )}

              {/* Media Preview */}
              {mediaPreview && (
                <div className="relative mt-3">
                  {mediaPreview.type === "video" ? (
                    <video src={mediaPreview.url} controls className="w-full max-h-64 rounded-lg" />
                  ) : (
                    <img
                      src={mediaPreview.url}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-1 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              {isExpanded && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaSelect}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload">
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Image className="w-4 h-4" />
                        Photo
                      </button>
                    </label>

                    <label htmlFor="media-upload">
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        Video
                      </button>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${content.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                      {content.length}/280
                    </span>
                    <button
                      type="submit"
                      disabled={(!content.trim() && !mediaFile) || loading || content.length > 280}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors text-sm"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost