import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  countComments,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", addComment);
router.delete("/:id", deleteComment);
router.get("/count", countComments);

export default router;
