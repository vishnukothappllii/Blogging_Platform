import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getPlatformStats,
    getRecentActivity,
    searchUsers,
    toggleUserStatus
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Admin-only routes
router.use(verifyJWT, isAdmin);

// User management
router.route('/users')
    .get(getAllUsers)
    .get(searchUsers); // GET /admin/users?search=query

router.route('/users/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

router.route('/users/:id/status')
    .patch(toggleUserStatus);

// Platform analytics
router.route('/stats')
    .get(getPlatformStats);

router.route('/activity')
    .get(getRecentActivity);

export default router;