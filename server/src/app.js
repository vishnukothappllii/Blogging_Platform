import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  import.meta.env.CORS_ORIGIN || "https://blogging-platform-pi-eight.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js";
import postRouter from "./routes/post.routes.js";
import followerRouter from "./routes/follower.routes.js";
import blogRouter from "./routes/blog.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/followers", followerRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app }