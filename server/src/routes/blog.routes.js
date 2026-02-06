import { Router } from 'express';
import {
    deleteBlog,
    getAllBlogs,
    getBlogById,
    publishABlog,
    togglePublishStatus,
    updateBlog,
} from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getAllBlogs)
    .post(
        upload.single("thumbnail"), // Only thumbnail needed
        publishABlog
    );

router
    .route("/:blogId")
    .get(getBlogById)
    .delete(deleteBlog)
    .patch(upload.single("thumbnail"), updateBlog);

router.route("/toggle/publish/:blogId").patch(togglePublishStatus);

export default router;