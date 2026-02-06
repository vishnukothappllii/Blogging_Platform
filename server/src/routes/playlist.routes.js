import { Router } from 'express';
import {
    addBlogToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeBlogFromPlaylist,
    updatePlaylist,
    searchPlaylists
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/")
    .post(upload.single("coverImage"), createPlaylist)
    .get(searchPlaylists); // GET /playlists?query=searchTerm

router.route("/user/:userId")
    .get(getUserPlaylists);

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(upload.single("coverImage"), updatePlaylist)
    .delete(deletePlaylist);

router.route("/:playlistId/add/:blogId")
    .patch(addBlogToPlaylist);

router.route("/:playlistId/remove/:blogId")
    .patch(removeBlogFromPlaylist);

export default router;