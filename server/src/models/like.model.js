import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const likeSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      index: true
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      index: true
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { 
    timestamps: true,
    // Prevents duplicate likes
    statics: {
      async hasLiked(userId, targetId, type) {
        return await this.exists({ 
          likedBy: userId, 
          [type]: targetId 
        });
      }
    }
  }
);

likeSchema.plugin(mongoosePaginate);
// Compound indexes for faster queries
likeSchema.index({ blog: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });

export const Like = mongoose.model("Like", likeSchema);