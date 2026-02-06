import { isValidObjectId } from "mongoose";
import { Follower } from "../models/follower.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleFollow = asyncHandler(async (req, res) => {
    const { authorId } = req.params;
    const followerId = req.user._id;

    if (!isValidObjectId(authorId)) {
        throw new ApiError(400, "Invalid author ID");
    }

    if (followerId.toString() === authorId.toString()) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    // Check if author exists
    const author = await User.findById(authorId);
    if (!author) {
        throw new ApiError(404, "Author not found");
    }

    // Check existing follow status
    const isFollowing = await Follower.isFollowing(followerId, authorId);

    if (isFollowing) {
        // Unfollow
        await Follower.findOneAndDelete({
            follower: followerId,
            author: authorId
        });

        // Update follower counts
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(authorId, { $inc: { followersCount: -1 } });

        return res
            .status(200)
            .json(new ApiResponse(200, { isFollowing: false }, "Unfollowed successfully"));
    }

    // Follow
    await Follower.create({ follower: followerId, author: authorId });

    // Update follower counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(authorId, { $inc: { followersCount: 1 } });

    return res
        .status(201)
        .json(new ApiResponse(201, { isFollowing: true }, "Followed successfully"));
});

const getUserFollowers = asyncHandler(async (req, res) => {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(authorId)) {
        throw new ApiError(400, "Invalid author ID");
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: {
            path: "follower",
            select: "name username avatar"
        }
    };

    const followers = await Follower.paginate({ author: authorId }, options);

    return res
        .status(200)
        .json(new ApiResponse(200, followers, "Followers fetched successfully"));
});

const getFollowingList = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: {
            path: "author",
            select: "name username avatar"
        }
    };

    const following = await Follower.paginate({ follower: userId }, options);

    return res
        .status(200)
        .json(new ApiResponse(200, following, "Following list fetched successfully"));
});

const checkFollowStatus = asyncHandler(async (req, res) => {
    const { authorId } = req.params;
    const followerId = req.user._id;

    if (!isValidObjectId(authorId)) {
        throw new ApiError(400, "Invalid author ID");
    }

    const isFollowing = await Follower.isFollowing(followerId, authorId);

    return res
        .status(200)
        .json(new ApiResponse(200, { isFollowing }, "Follow status checked"));
});

export { 
    toggleFollow, 
    getUserFollowers, 
    getFollowingList,
    checkFollowStatus 
};