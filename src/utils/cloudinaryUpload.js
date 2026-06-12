import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  fileBuffer,
  folder = "mcn"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uuidv4(),
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier
      .createReadStream(fileBuffer)
      .pipe(uploadStream);
  });
};