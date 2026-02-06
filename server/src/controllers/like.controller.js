import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleBlogLike = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(blogId)) {
    throw new ApiError(400, "Invalid blog ID");
  }

  // Check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check existing like
  const alreadyLiked = await Like.hasLiked(userId, blogId, "blog");

  if (alreadyLiked) {
    // Unlike
    await Like.findOneAndDelete({
      blog: blogId,
      likedBy: userId
    });

    // Decrement like count
    await Blog.findByIdAndUpdate(blogId, { $inc: { likesCount: -1 } });

    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Blog unliked successfully"));
  }

  // Like
  await Like.create({
    blog: blogId,
    likedBy: userId
  });

  // Increment like count
  await Blog.findByIdAndUpdate(blogId, { $inc: { likesCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, { isLiked: true }, "Blog liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Check if comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check existing like
  const alreadyLiked = await Like.hasLiked(userId, commentId, "comment");

  if (alreadyLiked) {
    // Unlike
    await Like.findOneAndDelete({
      comment: commentId,
      likedBy: userId
    });

    // Decrement like count
    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });

    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Comment unliked successfully"));
  }

  // Like
  await Like.create({
    comment: commentId,
    likedBy: userId
  });

  // Increment like count
  await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, { isLiked: true }, "Comment liked successfully"));
});

const getLikedBlogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: {
      path: "blog",
      select: "_id title description thumbnail createdAt",
      populate: {
        path: "author",
        select: "name avatar"
      }
    }
  };

  const likedBlogs = await Like.paginate(
    { likedBy: userId, blog: { $exists: true } },
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, likedBlogs, "Liked blogs fetched successfully"));
});

const getLikedComments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: {
      path: "comment",
      select: "_id content createdAt",
      populate: [
        {
          path: "owner",
          select: "name avatar"
        },
        {
          path: "blog",
          select: "title slug"
        }
      ]
    }
  };

  const likedComments = await Like.paginate(
    { likedBy: userId, comment: { $exists: true } },
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, likedComments, "Liked comments fetched successfully"));
});

const checkLikeStatus = asyncHandler(async (req, res) => {
  const { targetId, type } = req.params;
  const userId = req.user._id;

  if (!["blog", "comment"].includes(type)) {
    throw new ApiError(400, "Invalid like type");
  }

  if (!isValidObjectId(targetId)) {
    throw new ApiError(400, `Invalid ${type} ID`);
  }

  const isLiked = await Like.hasLiked(userId, targetId, type);

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked }, "Like status checked"));
});

export { 
  toggleBlogLike, 
  toggleCommentLike, 
  getLikedBlogs,
  getLikedComments,
  checkLikeStatus
};