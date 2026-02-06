import { Router } from 'express';
import { 
    createPost, 
    deletePost, 
    getUserPosts, 
    updatePost,
    getFeed,
    getPostsByHashtag,
    updatePostMedia
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
    .post(upload.single("media"), createPost)
    .get(getFeed); // GET /posts?page=1&limit=10

router.route("/user/:userId")
    .get(getUserPosts);

router.route("/hashtag/:hashtag")
    .get(getPostsByHashtag);

router.route("/:postId")
    .patch(updatePost)
    .delete(deletePost);

router.route("/:postId/media")
    .patch(upload.single("media"), updatePostMedia);

export default router;