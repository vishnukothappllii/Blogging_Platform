import mongoose, {Schema} from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2";

const followerSchema = new Schema({
    follower: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {
    timestamps: true,
    // Ensure unique follower-author pairs
    statics: {
        async isFollowing(followerId, authorId) {
            return await this.exists({ follower: followerId, author: authorId });
        }
    }
})

followerSchema.plugin(mongoosePaginate);

followerSchema.statics.isFollowing = async function (followerId, authorId) {
  return this.exists({ follower: followerId, author: authorId });
};

// Compound index for efficient queries
followerSchema.index({ follower: 1, author: 1 }, { unique: true });

export const Follower = mongoose.model("Follower", followerSchema)