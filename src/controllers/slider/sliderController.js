import prisma from "../../config/prisma.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

// Upload a slider image (Admin)
export const uploadSliderImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    let imageUrl = null;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "mcn/slider"
      );
      imageUrl = uploadedFile.secure_url;
    } else {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured",
      });
    }

    const { title } = req.body;

    const newImage = await prisma.sliderImage.create({
      data: {
        imageUrl,
        title: title || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Slider image uploaded successfully",
      data: newImage,
    });
  } catch (error) {
    console.error("Error uploading slider image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all slider images (Public)
export const getSliderImages = async (req, res) => {
  try {
    const images = await prisma.sliderImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Error getting slider images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete a slider image (Admin)
export const deleteSliderImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image ID",
      });
    }

    const image = await prisma.sliderImage.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Slider image not found",
      });
    }

    await prisma.sliderImage.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Slider image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slider image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
