import { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Blog } from "../models/blog.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body

    if (!name || !name.trim()) {
        throw new ApiError(400, "Playlist name is required")
    }

    // Handle cover image upload
    let coverImage = null
    if (req.file) {
        const coverImageLocalPath = req.file.path
        const uploadResult = await uploadOnCloudinary(coverImageLocalPath)
        if (uploadResult?.url) {
            coverImage = uploadResult.url
        }
    }

    const playlist = await Playlist.create({
        name,
        description,
        isPublic: isPublic === "true",
        owner: req.user._id,
        coverImage,
    })

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        sort: { createdAt: -1 },
    }

    const playlists = await Playlist.paginate({ owner: userId }, options)

    return res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate({
            path: "blogs",
            select: "_id title thumbnail description views createdAt",
            populate: {
                path: "author",
                select: "name avatar",
            },
        })
        .populate("owner", "name avatar")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // FIXED: Check if playlist is public OR user is the owner
    // Convert both IDs to strings for proper comparison
    const isOwner = playlist.owner._id.toString() === req.user._id.toString()

    if (!playlist.isPublic && !isOwner) {
        throw new ApiError(403, "Unauthorized to access this playlist")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addBlogToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, blogId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid playlist or blog ID")
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId)
    if (!blog) {
        throw new ApiError(404, "Blog not found")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user._id,
    })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    // Check if blog already in playlist
    if (playlist.blogs.includes(blogId)) {
        throw new ApiError(400, "Blog already in playlist")
    }

    playlist.blogs.push(blogId)
    await playlist.save()

    return res.status(200).json(new ApiResponse(200, playlist, "Blog added to playlist successfully"))
})

const removeBlogFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, blogId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid playlist or blog ID")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id,
        },
        {
            $pull: { blogs: blogId },
        },
        { new: true },
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Blog removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id,
    })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description, isPublic } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const updateData = {}
    if (name && name.trim()) updateData.name = name
    if (description) updateData.description = description
    if (isPublic !== undefined) updateData.isPublic = isPublic === "true"

    // Handle cover image update
    if (req.file) {
        const coverImageLocalPath = req.file.path
        const uploadResult = await uploadOnCloudinary(coverImageLocalPath)
        if (uploadResult?.url) {
            updateData.coverImage = uploadResult.url
        }
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id,
        },
        { $set: updateData },
        { new: true, runValidators: true },
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

const searchPlaylists = asyncHandler(async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query

    if (!query || query.trim().length < 3) {
        throw new ApiError(400, "Search query must be at least 3 characters")
    }

    const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        sort: { createdAt: -1 },
    }

    const playlists = await Playlist.paginate(
        {
            $text: { $search: query },
            isPublic: true,
        },
        options,
    )

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists search results"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addBlogToPlaylist,
    removeBlogFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    searchPlaylists,
}
