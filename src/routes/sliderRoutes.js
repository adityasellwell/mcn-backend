import express from "express";
import {
  uploadSliderImage,
  getSliderImages,
  deleteSliderImage,
} from "../controllers/slider/sliderController.js";
import upload from "../middleware/uploadMiddleware.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: Get all slider images
router.get("/", getSliderImages);

// Admin: Upload a slider image
router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  uploadSliderImage
);

// Admin: Delete a slider image
router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  deleteSliderImage
);

export default router;
