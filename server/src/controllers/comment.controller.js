import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getBlogComments = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "owner",
            select: "name avatar"
        }
    };

    const comments = await Comment.paginate(
        { blog: blogId, parentComment: null },
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    const comment = await Comment.create({
        content,
        blog: blogId,
        owner: req.user._id
    });

    // Increment blog comment count
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findOne({
        _id: commentId,
        owner: req.user._id
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    // Decrement blog comment count
    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentCount: -1 } });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const addReply = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Reply content is required");
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
        throw new ApiError(404, "Parent comment not found");
    }

    const reply = await Comment.create({
        content,
        blog: parentComment.blog,
        owner: req.user._id,
        parentComment: commentId,
        depth: parentComment.depth + 1
    });

    // Increment blog comment count
    await Blog.findByIdAndUpdate(parentComment.blog, { $inc: { commentCount: 1 } });

    return res
        .status(201)
        .json(new ApiResponse(201, reply, "Reply added successfully"));
});

const getReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
            path: "owner",
            select: "name avatar"
        }
    };

    const replies = await Comment.paginate(
        { parentComment: commentId },
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200, replies, "Replies fetched successfully"));
});

export { 
    getBlogComments, 
    addComment, 
    updateComment, 
    deleteComment,
    addReply,
    getReplies
};