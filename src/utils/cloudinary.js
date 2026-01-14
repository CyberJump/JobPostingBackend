import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath){
            return null;
        }
        const response=await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"});
        // console.log("Cloudinary upload response:", response.url);
        console.log("Cloudinary Uploaded successfully");
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);
        console.error("Cloudinary upload error:", error);
        return null;
    }
}

const DeletefromCloudinary=async (publicid)=>{
    try{
        if(!publicid){
            return null
        }
        const response=await cloudinary.uploader.destroy(publicid);
        console.log("File deleted from cloudinary");
        return response
    }catch(err){
        console.error("Cloudinary Error deleting:",err);
        return null;
    }
}
export {uploadOnCloudinary,DeletefromCloudinary};

