import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getBlogComments,
    updateComment,
    getReplies,
    addReply
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/blog/:blogId")
    .get(getBlogComments)
    .post(addComment);

router.route("/reply/:commentId")
    .get(getReplies)
    .post(addReply);

router.route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

export default router;