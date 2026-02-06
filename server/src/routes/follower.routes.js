import { Router } from 'express';
import {
    toggleFollow, 
    getUserFollowers, 
    getFollowingList,
    checkFollowStatus
} from "../controllers/follower.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

// Follow/unfollow an author
router.route("/:authorId").post(toggleFollow);

// Get followers of an author
router.route("/:authorId").get(getUserFollowers);

// Get who a user is following
router.route("/following/:userId").get(getFollowingList);

// Check if current user follows an author
router.route("/status/:authorId").get(checkFollowStatus);

export default router;