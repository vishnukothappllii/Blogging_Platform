import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const postSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 280
    },
    media: {
        type: String // Cloudinary URL for images/GIFs
    },
    hashtags: [{
        type: String,
        trim: true
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for engagement metrics
postSchema.virtual('engagementRate').get(function() {
    if (this.likesCount + this.commentsCount === 0) return 0;
    return ((this.likesCount + this.commentsCount) / this.reachEstimate) * 100;
});

// Add pagination plugin
postSchema.plugin(mongoosePaginate);

// Indexes for faster queries
postSchema.index({ owner: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);