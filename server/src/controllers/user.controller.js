import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { sendMail } from "../utils/mailer.js";

const otpStore = {};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, bio, role } = req.body

    if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All required fields must be provided")
    }

    if (username.length < 3 || username.length > 20) {
        throw new ApiError(400, "Username must be between 3-20 characters")
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters")
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Upload to Cloudinary and get public_id
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar || !avatar.public_id) {
        throw new ApiError(400, "Failed to upload avatar")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        bio: bio || "",
        role: role || "user", // Default to 'user' if not provided
        avatar: {
            url: avatar.url,
            public_id: avatar.public_id
        },
        coverImage: coverImage ? {
            url: coverImage.url,
            public_id: coverImage.public_id
        } : null
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Failed to register user")
    }

    // Send welcome email
    await sendMail(
        email,
        "Welcome to Blogging Platform",
        `<h3>Hello ${fullName},</h3>
        <p>Welcome to our community! Your account has been successfully created.</p>
        <p>Start exploring and sharing your thoughts with the world!</p>`
    );

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[user.email] = otp;  // Stores OTP with user's email

    await sendMail(
        user.email,
        "Your Login OTP",
        `Your one-time login code is: <strong>${otp}</strong><br>
        <p>This code will expire in 10 minutes.</p>`
    );

    return res.status(200).json(
        new ApiResponse(200, { 
            message: 'OTP sent to email', 
            requiresOtp: true,
            email: user.email  // Sends back the user's email
        })
    )
})

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    if (otpStore[email] !== otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    delete otpStore[email];
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 10 * 60 * 1000 // 10 minutes
    };

    await sendMail(
        email,
        "Login Successful",
        `<h3>Hello ${user.fullName},</h3>
        <p>You've successfully logged in to your account.</p>
        <p>If this wasn't you, please contact support immediately.</p>`
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, 
            accessToken, 
            refreshToken
        }, "OTP verified successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed"
            ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both passwords are required")
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid current password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    await sendMail(
        user.email,
        "Password Changed",
        `<h3>Password Update Notification</h3>
        <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
        <p>If you didn't make this change, please contact support immediately.</p>`
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken")
        .populate({
            path: 'readHistory',
            select: 'title slug thumbnail createdAt',
            options: { limit: 5, sort: { createdAt: -1 } }
        });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, bio, website, location, socialLinks } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "Full name and email are required")
    }

    const updateData = {
        fullName,
        email,
        bio: bio || "",
        website: website || "",
        location: location || "",
        socialLinks: socialLinks || {}
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id)
    }

    // Upload new avatar
    const newAvatar = await uploadOnCloudinary(avatarLocalPath)
    if (!newAvatar || !newAvatar.public_id) {
        throw new ApiError(500, "Failed to upload avatar")
    }

    // Update user
    user.avatar = {
        url: newAvatar.url,
        public_id: newAvatar.public_id
    }
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Delete old cover image from Cloudinary if exists
    if (user.coverImage?.public_id) {
        await deleteFromCloudinary(user.coverImage.public_id)
    }

    // Upload new cover image
    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!newCoverImage || !newCoverImage.public_id) {
        throw new ApiError(500, "Failed to upload cover image")
    }

    // Update user
    user.coverImage = {
        url: newCoverImage.url,
        public_id: newCoverImage.public_id
    }
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated"))
})

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user._id;
    const currentUser = req.user;

    // Admin can delete any user, users can delete themselves
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
        throw new ApiError(403, "Unauthorized to delete this account")
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Delete assets from Cloudinary
    if (user.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id)
    }
    if (user.coverImage?.public_id) {
        await deleteFromCloudinary(user.coverImage.public_id)
    }

    // Delete user from database
    await User.findByIdAndDelete(userId)

    // Send notification email
    await sendMail(
        user.email,
        "Account Deleted",
        `<h3>Account Closure Notification</h3>
        <p>Your account has been successfully deleted.</p>
        <p>We're sorry to see you go. If this was a mistake, contact support within 7 days.</p>`
    );

    // If user deleted themselves, clear cookies
    if (currentUser._id.toString() === userId) {
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Account deleted successfully"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User account deleted"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        { $match: { username: username.toLowerCase() } },
        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "author",
                as: "followers"
            }
        },
        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "follower",
                as: "following"
            }
        },
        {
            $addFields: {
                followersCount: { $size: "$followers" },
                followingCount: { $size: "$following" },
                isFollowing: {
                    $cond: {
                        if: { $in: [req.user?._id, "$followers.follower"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                bio: 1,
                createdAt: 1,
                followersCount: 1,
                followingCount: 1,
                isFollowing: 1,
                website: 1,
                location: 1,
                socialLinks: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel profile fetched"))
})

const getReadHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'readHistory',
            select: 'title slug thumbnail views createdAt',
            populate: {
                path: 'author',
                select: 'username fullName avatar'
            },
            options: { sort: { createdAt: -1 }, limit: 20 }
        })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.readHistory, "Read history fetched"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    verifyOtp,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    deleteUser,
    generateAccessAndRefreshTokens,
    updateUserCoverImage,
    getUserChannelProfile,
    getReadHistory
}