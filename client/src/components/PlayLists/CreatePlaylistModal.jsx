import { useState } from "react"
import { X, Upload } from "lucide-react"
import { usePlaylist } from "../../contexts/PlaylistContext"

export function CreatePlaylistModal({ isOpen, onClose, editPlaylist = null }) {
  const [formData, setFormData] = useState({
    name: editPlaylist?.name || "",
    description: editPlaylist?.description || "",
    isPublic: editPlaylist?.isPublic || false,
    coverImage: null,
  })
  const [preview, setPreview] = useState(editPlaylist?.coverImage || null)

  const { createPlaylist, updatePlaylist, loading } = usePlaylist()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submitData = new FormData()
    submitData.append("name", formData.name)
    submitData.append("description", formData.description)
    submitData.append("isPublic", formData.isPublic)
    if (formData.coverImage) {
      submitData.append("coverImage", formData.coverImage)
    }

    try {
      if (editPlaylist) {
        await updatePlaylist(editPlaylist._id, submitData)
      } else {
        await createPlaylist(submitData)
      }
      onClose()
      setFormData({ name: "", description: "", isPublic: false, coverImage: null })
      setPreview(null)
    } catch (error) {
      console.error("Failed to save playlist:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{editPlaylist ? "Edit Playlist" : "Create New Playlist"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Playlist Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter playlist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter playlist description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="flex items-center space-x-4">
              {preview && (
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
              )}
              <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200">
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make this playlist public
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : editPlaylist ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
