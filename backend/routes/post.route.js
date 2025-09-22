import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  dislikePost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// CREATE POST
router.post("/create", isAuthenticated, upload.single("image"), addNewPost);

// GET ALL POSTS
router.get("/all", isAuthenticated, getAllPost);

// GET USER POSTS
router.get("/userpost/all", isAuthenticated, getUserPost);

// LIKE / DISLIKE POST
router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);

// COMMENTS
router.get("/:id/comment/all", isAuthenticated, getCommentsOfPost); // GET comments first
router.post("/:id/comment", isAuthenticated, addComment); // Then POST comment

// DELETE POST
router.delete("/delete/:id", isAuthenticated, deletePost);

// BOOKMARK POST
router.get("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;
