import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
                },
                message: props => `${props.value} is not a valid email!`
            }
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        bio: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200
        },
        avatar: {
            url: String,
            public_id: String
        },
        coverImage: {
            url: String,
            public_id: String
        },
        readHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Blog"
        }],
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long']
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        followersCount: {
            type: Number,
            default: 0
        },
        followingCount: {
            type: Number,
            default: 0
        },
        refreshToken: {
            type: String
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        lastLogin: {
            type: Date
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'pending'],
            default: 'active'
        },
        website: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        socialLinks: {
            twitter: String,
            linkedin: String,
            github: String
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.refreshToken;
                return ret;
            }
        },
        toObject: {
            virtuals: true
        }
    }
)

userSchema.plugin(mongoosePaginate);


// Virtual for engagement rate
userSchema.virtual('engagementRate').get(function () {
    if (this.followersCount === 0) return 0;
    return ((this.likesCount + this.commentsCount) / this.followersCount) * 100;
});

userSchema.virtual('blogs', {
    ref: 'Blog',
    localField: '_id',
    foreignField: 'author',
    justOne: false
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    // Increase salt rounds for better security
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    )
}

export const User = mongoose.model("User", userSchema)