import express from "express";
import { createChapter, getAllChapters, getChapterById, updateChapter, deleteChapter } from "../controllers/chapter/chapterController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


router.get(
  "/public",
  getAllChapters
);

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  createChapter
);

router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getAllChapters
);

router.get(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getChapterById
);

router.put(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  updateChapter
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  deleteChapter
);

export default router;