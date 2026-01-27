import "dotenv/config";

import { v2 as cloudinary } from "cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary";
import multer from "multer";

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage (Direct upload)
const storage = new CloudinaryStorage({
  cloudinary: { v2: cloudinary } as any,
  params: {
    folder: "e-commerce-products", // The folder name in your Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Auto-resize!
  } as any, // 'as any' fixes a known TypeScript type issue with this library
});

// 3. Create the Multer Middleware
export const upload = multer({ storage });
