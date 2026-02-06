import { useState, useEffect } from "react"
import { Plus, Search, Grid, List } from "lucide-react"
import { usePlaylist } from "../../contexts/PlaylistContext"
import { PlaylistCard } from "./PlaylistCard"
import { CreatePlaylistModal } from "./CreatePlaylistModal"
import { PlaylistView } from "./PlaylistView"

export function PlaylistDashboard({ userId }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [viewingPlaylist, setViewingPlaylist] = useState(null)

  const { playlists, getUserPlaylists, searchPlaylists, loading } = usePlaylist()

  useEffect(() => {
    if (userId) {
      getUserPlaylists(userId)
    }
  }, [userId])

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim().length >= 3) {
      await searchPlaylists(query)
    } else if (query.trim().length === 0 && userId) {
      await getUserPlaylists(userId)
    }
  }

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist)
    setShowCreateModal(true)
  }

  const handleView = (playlist) => {
    setViewingPlaylist(playlist)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingPlaylist(null)
  }

  if (viewingPlaylist) {
    return <PlaylistView playlist={viewingPlaylist} onBack={() => setViewingPlaylist(null)} />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
          <p className="text-gray-600 mt-1">Organize your favorite blogs into collections</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Playlist
        </button>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Playlists Grid/List */}
      {!loading && (
        <>
          {playlists.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} onEdit={handleEdit} onView={handleView} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No playlists yet</h3>
              <p className="text-gray-600 mb-6">Create your first playlist to organize your favorite blogs</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Playlist
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <CreatePlaylistModal isOpen={showCreateModal} onClose={handleCloseModal} editPlaylist={editingPlaylist} />
    </div>
  )
}
