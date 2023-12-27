import express, { Router } from 'express';
const { getAllPosts, bookmarkPost, getPost, deletePost, updatePost, createPost } = require("../controllers/postsController")
const postRouter: Router = express.Router()

postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPost).post("/:id", updatePost);
postRouter.delete("/:id", deletePost);
postRouter.post("/bookmark/post", bookmarkPost);
postRouter.post("/createPost", createPost);

module.exports = postRouter