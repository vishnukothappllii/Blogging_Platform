import { isValidObjectId } from "mongoose";
import { Post } from "../models/post.model.js";
import { Follower } from "../models/follower.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { extractHashtags } from "../utils/hashtagUtils.js";

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!content || !content.trim()) {
        throw new ApiError(400, "Post content is required");
    }
    
    // Handle media upload
    let mediaUrl = null;
    if (req.file) {
        const mediaLocalPath = req.file.path;
        const uploadResult = await uploadOnCloudinary(mediaLocalPath);
        if (uploadResult?.url) {
            mediaUrl = uploadResult.url;
        }
    }
    
    // Extract hashtags from content
    const hashtags = extractHashtags(content);
    
    const post = await Post.create({
        content,
        media: mediaUrl,
        hashtags,
        owner: userId
    });

    return res
        .status(201)
        .json(new ApiResponse(201, post, "Post created successfully"));
});

const getUserPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "owner",
            select: "name username avatar"
        }
    };
    
    const posts = await Post.paginate({ owner: userId }, options);
    
    return res
        .status(200)
        .json(new ApiResponse(200, posts, "User posts fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }
    
    if (!content || !content.trim()) {
        throw new ApiError(400, "Post content is required");
    }
    
    const post = await Post.findOne({
        _id: postId,
        owner: userId
    });
    
    if (!post) {
        throw new ApiError(404, "Post not found or unauthorized");
    }
    
    // Extract hashtags from content
    const hashtags = extractHashtags(content);
    
    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { 
            content,
            hashtags,
            // Prevent media update for now - use separate endpoint for media
        },
        { new: true }
    );
    
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }
    
    const post = await Post.findOneAndDelete({
        _id: postId,
        owner: userId
    });
    
    if (!post) {
        throw new ApiError(404, "Post not found or unauthorized");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getFeed = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    // Get users that current user follows
    const following = await Follower.find({ follower: userId }).distinct("author");
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "owner",
            select: "name username avatar"
        }
    };
    
    // Get posts from followed users and current user
    const feed = await Post.paginate({
        owner: { $in: [...following, userId] }
    }, options);
    
    return res
        .status(200)
        .json(new ApiResponse(200, feed, "Feed fetched successfully"));
});

const getPostsByHashtag = asyncHandler(async (req, res) => {
    const { hashtag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!hashtag) {
        throw new ApiError(400, "Hashtag is required");
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "owner",
            select: "name username avatar"
        }
    };
    
    const posts = await Post.paginate({
        hashtags: { $regex: new RegExp(`^${hashtag}$`, "i") }
    }, options);
    
    return res
        .status(200)
        .json(new ApiResponse(200, posts, "Hashtag posts fetched successfully"));
});

const updatePostMedia = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }
    
    if (!req.file) {
        throw new ApiError(400, "Media file is required");
    }
    
    const mediaLocalPath = req.file.path;
    const uploadResult = await uploadOnCloudinary(mediaLocalPath);
    
    if (!uploadResult?.url) {
        throw new ApiError(500, "Failed to upload media");
    }
    
    const updatedPost = await Post.findOneAndUpdate(
        { _id: postId, owner: userId },
        { media: uploadResult.url },
        { new: true }
    );
    
    if (!updatedPost) {
        throw new ApiError(404, "Post not found or unauthorized");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post media updated successfully"));
});

export { 
    createPost, 
    getUserPosts, 
    updatePost, 
    deletePost,
    getFeed,
    getPostsByHashtag,
    updatePostMedia
};