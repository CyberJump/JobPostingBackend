import { uploadOnCloudinary, DeletefromCloudinary } from "../../utils/cloudinary.js";
import logger from "../../shared/logging/logger.js";

export const storagePort = {
    async uploadFile(localFilePath, folder = "") {
        return await uploadOnCloudinary(localFilePath, folder);
    },

    async deleteFile(publicId, resourceType = "image") {
        return await DeletefromCloudinary(publicId, resourceType);
    },
};

export default storagePort;
