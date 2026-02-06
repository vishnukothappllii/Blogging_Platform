import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    coverImage: {
        type: String // Cloudinary URL
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for blog count
playlistSchema.virtual('blogCount').get(function() {
    return this.blogs.length;
});

// Add pagination plugin
playlistSchema.plugin(mongoosePaginate);

// Indexes for faster queries
playlistSchema.index({ owner: 1 });
playlistSchema.index({ name: "text", description: "text" });

export const Playlist = mongoose.model("Playlist", playlistSchema);