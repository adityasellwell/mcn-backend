import express from "express";

import { createVisitor, getAllVisitors, getVisitorById, updateVisitor,  deleteVisitor, convertVisitorToMember } from "../controllers/visitor/visitorController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  createVisitor
);

router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getAllVisitors
);

router.get(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getVisitorById
);

router.put(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  updateVisitor
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  deleteVisitor
);


router.post(
  "/:id/convert",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  convertVisitorToMember
);

export default router;