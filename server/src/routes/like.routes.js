import { Router } from 'express';
import {
  toggleBlogLike,
  toggleCommentLike,
  getLikedBlogs,
  getLikedComments,
  checkLikeStatus
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// Like/unlike endpoints
router.route("/blog/:blogId").post(toggleBlogLike);
router.route("/comment/:commentId").post(toggleCommentLike);

// Get liked content
router.route("/blogs").get(getLikedBlogs);
router.route("/comments").get(getLikedComments);

// Check like status
router.route("/status/:type/:targetId").get(checkLikeStatus);

export default router;