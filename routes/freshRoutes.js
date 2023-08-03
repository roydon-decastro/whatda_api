import express from "express";
import { getFreshPosts } from "../controllers/freshController.js";

const router = express.Router();

router.get("/", getFreshPosts);

export default router;
