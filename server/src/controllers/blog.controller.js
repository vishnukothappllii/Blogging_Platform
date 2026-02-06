import mongoose, { isValidObjectId } from "mongoose";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const pipeline = [];
    const match = {};

    // Search filter
    if (query) {
        match.$or = [
            { title: { $regex: query, $options: "i" } },
            { content: { $regex: query, $options: "i" } }
        ];
    }

    // Author and publication filter
    if (userId && isValidObjectId(userId)) {
        match.author = new mongoose.Types.ObjectId(userId);
        if (userId !== req.user._id.toString()) {
            match.isPublished = true;
        }
    } else {
        match.isPublished = true;
    }

    pipeline.push({ $match: match });

    // Author details lookup
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [{ $project: { name: 1, avatar: 1 } }]
        }
    });
    pipeline.push({ $unwind: "$author" });

    // Sorting
    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;
    pipeline.push({ $sort: sort });

    // Pagination
    const options = {
        page: Math.max(parseInt(page), 1),
        limit: Math.max(parseInt(limit), 1),
        customLabels: {
            totalDocs: "totalBlogs",
            docs: "blogs",
            page: "currentPage"
        }
    };

    const blogs = await Blog.aggregatePaginate(
        Blog.aggregate(pipeline),
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
});

const publishABlog = asyncHandler(async (req, res) => {
    const { title, description, content, tags } = req.body;

    if (!title?.trim()) throw new ApiError(400, "Title is required");
    if (!description?.trim()) throw new ApiError(400, "Description is required");
    if (!content?.trim()) throw new ApiError(400, "Content is required");

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) throw new ApiError(500, "Thumbnail upload failed");

    const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

    const blog = await Blog.create({
    title,
    slug,
    description,
    content,
    thumbnail: thumbnail.url,
    author: req.user._id,
    tags: tags?.split(",").map(tag => tag.trim()) || []
});

    return res
        .status(201)
        .json(new ApiResponse(201, blog, "Blog published successfully"));
});


const getBlogById = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    const blog = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { views: 1 } },
        { new: true }
    ).populate("author", "name avatar");

    if (!blog) throw new ApiError(404, "Blog not found");

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog fetched successfully"));
});

const updateBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { title, description, content, tags } = req.body;

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found");
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to edit this blog");
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags.split(",").map(tag => tag.trim());

    // Handle thumbnail update
    if (req.file) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (!thumbnail?.url) throw new ApiError(500, "Thumbnail upload failed");
        updateData.thumbnail = thumbnail.url;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found");
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this blog");
    }

    await Blog.findByIdAndDelete(blogId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Blog deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found");
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to modify this blog");
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Publish status updated"));
});

export {
    getAllBlogs,
    publishABlog,
    getBlogById,
    updateBlog,
    deleteBlog,
    togglePublishStatus
};