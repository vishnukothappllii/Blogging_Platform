import { Router } from 'express';
import {
    getAuthorStats,
    getAuthorBlogs,
    getAnalytics
} from "../controllers/dashboard.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/stats")
    .get(getAuthorStats);

router.route("/blogs")
    .get(getAuthorBlogs);

router.route("/analytics")
    .get(getAnalytics);

export default router;