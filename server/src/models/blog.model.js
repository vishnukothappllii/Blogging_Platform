import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const blogSchema = new Schema(
    {
        thumbnail: {
            type: String, // cloudinary URL
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String, // Short preview description
            required: true
        },
        commentCount: {
            type: Number,
            default: 0
        },
        content: {
            type: String,  // HTML content from Quill.js
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        tags: {
            type: [String]
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Generate slug before saving
blogSchema.pre("save", function (next) {
    if (!this.isModified("title")) return next();

    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    next();
});

blogSchema.plugin(mongoosePaginate);
blogSchema.plugin(aggregatePaginate);
export const Blog = mongoose.model("Blog", blogSchema);