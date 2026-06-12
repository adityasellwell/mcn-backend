import express from "express";

import {
  assignRole,
  getAllChapterRoles,
  getChapterRoles,
  updateRole,
  removeRole,
} from "../controllers/chapterRole/chapterRoleController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  assignRole
);

router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getAllChapterRoles
);

router.get(
  "/chapter/:chapterId",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getChapterRoles
);

router.put(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  updateRole
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  removeRole
);

export default router;