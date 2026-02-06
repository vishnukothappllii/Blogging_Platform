import { Blog } from "../models/blog.model.js";
import { Follower } from "../models/follower.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getAuthorStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    // Get counts including published/draft status
    const [totalBlogs, publishedBlogs, draftBlogs, totalFollowers, totalFollowing] = await Promise.all([
        Blog.countDocuments({ author: userId }),
        Blog.countDocuments({ author: userId, isPublished: true }),
        Blog.countDocuments({ author: userId, isPublished: false }),
        Follower.countDocuments({ author: userId }),
        Follower.countDocuments({ follower: userId })
    ]); 
    
    // Get engagement metrics
    const engagement = await Blog.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(userId) } },
        { 
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likesCount" },
                totalComments: { $sum: "$commentCount" }
            } 
        }
    ]);
    
    // Get top performing blogs
    const topBlogs = await Blog.find({ author: userId })
        .sort({ views: -1, likesCount: -1 })
        .limit(5)
        .select("title views likesCount commentCount");
    
    // Get audience demographics (simplified example)
    const audience = await Follower.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(userId) } },
        { $lookup: {
            from: "users",
            localField: "follower",
            foreignField: "_id",
            as: "followerData"
        }},
        { $unwind: "$followerData" },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            locations: { 
                $addToSet: { 
                    country: "$followerData.country",
                    city: "$followerData.city" 
                }
            }
        }}
    ]);
    
    const stats = {
        overview: {
            totalBlogs,
            publishedBlogs, // Added
            draftBlogs,     // Added
            totalFollowers,
            totalFollowing,
            totalViews: engagement[0]?.totalViews || 0,
            totalLikes: engagement[0]?.totalLikes || 0,
            totalComments: engagement[0]?.totalComments || 0
        },
        engagement: {
            avgViewDuration: 0, // Placeholder for future implementation
            engagementRate: totalFollowers > 0 
                ? ((engagement[0]?.totalLikes || 0) + (engagement[0]?.totalComments || 0)) / totalFollowers * 100
                : 0
        },
        topContent: topBlogs,
        audience: {
            total: audience[0]?.total || 0,
            locations: audience[0]?.locations || []
        }
    };
    
    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Author stats fetched successfully"));
});

const getAuthorBlogs = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = -1 } = req.query;
    
    const filter = { author: userId };
    if (status === 'published') filter.isPublished = true;
    if (status === 'drafts') filter.isPublished = false;
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortOrder) },
        select: "title views likesCount commentCount isPublished createdAt slug"
    };
    
    const blogs = await Blog.paginate(filter, options);
    
    return res
        .status(200)
        .json(new ApiResponse(200, blogs, "Author blogs fetched successfully"));
});

const getAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { period = "30d" } = req.query;
    
    // Calculate date range based on period
    const periods = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365
    };
    
    const days = periods[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get views and likes over time
    const viewsData = await Blog.aggregate([
        { $match: { 
            author: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
        }},
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: "$views" },
            likes: { $sum: "$likesCount" }
        }},
        { $sort: { _id: 1 } }
    ]);
    
    // Get traffic sources (simplified example)
    const trafficSources = {
        direct: Math.floor(Math.random() * 100),
        search: Math.floor(Math.random() * 100),
        social: Math.floor(Math.random() * 100),
        referral: Math.floor(Math.random() * 100)
    };
    
    // Get popular content
    const popularContent = await Blog.find({ 
        author: userId,
        createdAt: { $gte: startDate }
    })
    .sort({ views: -1 })
    .limit(5)
    .select("title views slug");
    
    const analytics = {
        timeline: viewsData,
        trafficSources,
        popularContent
    };
    
    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Analytics data fetched successfully"));
});

export { getAuthorStats, getAuthorBlogs, getAnalytics };