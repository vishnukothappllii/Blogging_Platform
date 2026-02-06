import { useState, useEffect } from "react";
import { Plus, BookmarkPlus } from "lucide-react";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBlog } from "../../contexts/BlogContext";

export function BlogPlaylistManager({ blogId, onClose }) {
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const {
    playlists,
    getUserPlaylists,
    addBlogToPlaylist,
    removeBlogFromPlaylist,
    createPlaylist,
    loading,
  } = usePlaylist();
  const { user } = useAuth();
  const { blogs, getAllBlogs } = useBlog();

  useEffect(() => {
    if (user?._id) {
      getUserPlaylists(user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    // Check which playlists already contain this blog
    const playlistsWithBlog = playlists.filter((playlist) =>
      playlist.blogs?.some((blog) => blog._id === blogId || blog === blogId)
    );
    setSelectedPlaylists(playlistsWithBlog.map((p) => p._id));
  }, [playlists, blogId]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        await getAllBlogs();
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const handlePlaylistToggle = async (playlistId) => {
    const isSelected = selectedPlaylists.includes(playlistId);

    try {
      if (isSelected) {
        await removeBlogFromPlaylist(playlistId, blogId);
        setSelectedPlaylists((prev) => prev.filter((id) => id !== playlistId));
      } else {
        await addBlogToPlaylist(playlistId, blogId);
        setSelectedPlaylists((prev) => [...prev, playlistId]);
      }
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const formData = new FormData();
      formData.append("name", newPlaylistName);
      formData.append("isPublic", "false");

      const response = await createPlaylist(formData);
      const newPlaylistId = response.data._id;

      // Add blog to the new playlist
      await addBlogToPlaylist(newPlaylistId, blogId);
      setSelectedPlaylists((prev) => [...prev, newPlaylistId]);

      setNewPlaylistName("");
      setShowCreateNew(false);
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BookmarkPlus className="w-5 h-5 mr-2" />
            Add to Playlist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Existing Playlists */}
            <div className="space-y-2 mb-4">
              {playlists.map((playlist) => (
                <label
                  key={playlist._id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlaylists.includes(playlist._id)}
                    onChange={() => handlePlaylistToggle(playlist._id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{playlist.name}</div>
                    <div className="text-sm text-gray-500">
                      {playlist.blogs?.length || 0} blogs
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Create New Playlist */}
            {!showCreateNew ? (
              <button
                onClick={() => setShowCreateNew(true)}
                className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Playlist
              </button>
            ) : (
              <form onSubmit={handleCreatePlaylist} className="space-y-3">
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create & Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateNew(false);
                      setNewPlaylistName("");
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
