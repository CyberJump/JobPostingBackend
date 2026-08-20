import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../config/env.js";
import logger from "../shared/logging/logger.js";

cloudinary.config({ 
  cloud_name: config.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: config.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET
});

// Helper to extract Cloudinary public_id from full URL including folder paths
const extractPublicId = (urlOrPublicId) => {
    if (!urlOrPublicId) return null;
    if (typeof urlOrPublicId !== "string") return null;
    if (!urlOrPublicId.includes("cloudinary.com")) return urlOrPublicId;

    try {
        const uploadIndex = urlOrPublicId.indexOf("/upload/");
        if (uploadIndex === -1) return urlOrPublicId;
        let pathAfterUpload = urlOrPublicId.substring(uploadIndex + 8);

        // Strip optional version prefix e.g. v1234567/
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

        // Strip file extension (.jpg, .pdf, .png, etc.)
        const lastDotIndex = pathAfterUpload.lastIndexOf(".");
        if (lastDotIndex !== -1) {
            pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
        }

        return pathAfterUpload;
    } catch (e) {
        return urlOrPublicId;
    }
};

// Upload images (auto resource type)
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        logger.error({ err: error, path: localFilePath }, "Cloudinary image upload error");
        return null;
    }
};

// Upload documents (PDF, DOC, etc.) with raw resource type for public access
const uploadDocumentOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "raw",
            folder: "resumes",
            access_mode: "public"
        });
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        logger.error({ err: error, path: localFilePath }, "Cloudinary document upload error");
        return null;
    }
};

const DeletefromCloudinary = async (urlOrPublicId, resourceType = "image") => {
    try {
        const publicId = extractPublicId(urlOrPublicId);
        if (!publicId) {
            return null;
        }
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        logger.info({ publicId, resourceType, result: response?.result }, "Cloudinary file deleted");
        return response;
    } catch (err) {
        logger.error({ err, urlOrPublicId }, "Cloudinary Error deleting asset");
        return null;
    }
};

export { uploadOnCloudinary, uploadDocumentOnCloudinary, DeletefromCloudinary, extractPublicId };
