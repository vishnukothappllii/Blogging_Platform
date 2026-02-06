import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        blog: {
            type: Schema.Types.ObjectId,
            ref: "Blog",
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        depth: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.plugin(mongoosePaginate);

export const Comment = mongoose.model("Comment", commentSchema);