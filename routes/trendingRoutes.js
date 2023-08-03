import express from "express";
import { getTrendingPosts } from "../controllers/trendingController.js";

const router = express.Router();

router.get("/", getTrendingPosts);

export default router;
