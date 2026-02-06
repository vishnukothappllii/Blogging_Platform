import { useState } from "react"
import { MoreVertical, Edit, Trash2, Eye, Lock, Globe } from "lucide-react"
import { usePlaylist } from "../../contexts/PlaylistContext"

export function PlaylistCard({ playlist, onEdit, onView }) {
  const [showMenu, setShowMenu] = useState(false)
  const { deletePlaylist } = usePlaylist()

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await deletePlaylist(playlist._id)
      } catch (error) {
        console.error("Failed to delete playlist:", error)
      }
    }
    setShowMenu(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {playlist.coverImage ? (
          <img
            src={playlist.coverImage || "/placeholder.svg"}
            alt={playlist.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{playlist.name.charAt(0).toUpperCase()}</span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    onView(playlist)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Playlist
                </button>
                <button
                  onClick={() => {
                    onEdit(playlist)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Playlist
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Playlist
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-2 left-2">
          {playlist.isPublic ? (
            <Globe className="w-5 h-5 text-white bg-black bg-opacity-50 rounded-full p-1" />
          ) : (
            <Lock className="w-5 h-5 text-white bg-black bg-opacity-50 rounded-full p-1" />
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{playlist.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{playlist.description || "No description"}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{playlist.blogs?.length || 0} blogs</span>
          <span>{playlist.isPublic ? "Public" : "Private"}</span>
        </div>
      </div>
    </div>
  )
}
