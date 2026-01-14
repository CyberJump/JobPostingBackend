import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {DeletefromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {Student} from "../models/student.models.js";

const CreateStudentProfile=asynchandler(async(req,res)=>{
    // Check if student profile already exists
    const existingProfile=await Student.findOne({userId:req.user._id});
    if(existingProfile){
        throw new ApiError(400,"Student profile already exists");
    }

    // Extract student details from request body
    const {branch, college, year}=req.body;

    // Validate required fields
    if(!branch || !college || !year){
        throw new ApiError(400,"Branch, college, and year are required");
    }

    // Handle verification document upload (ID card, enrollment letter, etc.)
    const verificationDocPath=req.file?.path;

    if(!verificationDocPath){
        throw new ApiError(400,"Verification document is required (ID card, enrollment letter, etc.)");
    }

    // Upload verification document to Cloudinary
    const verificationDoc=await uploadOnCloudinary(verificationDocPath);
    
    if(!verificationDoc){
        throw new ApiError(500,"Failed to upload verification document");
    }

    // Create student profile with PENDING status (awaits admin approval)
    const studentProfile=await Student.create({
        userId:req.user._id,
        branch,
        college,
        year,
        verificationDocument:verificationDoc.url,
        status:"PENDING"
    });

    const createdProfile=await Student.findById(studentProfile._id).populate('userId','name email username profilePicture');

    if(!createdProfile){
        throw new ApiError(500,"Failed to create student profile");
    }

    return res.status(201).json(
        new ApiResponse(200,createdProfile,"Student profile created successfully. Awaiting admin approval.")
    );
});

const GetStudentDetails=asynchandler(async(req,res)=>{
    const studentProfile=await Student.findOne({userId:req.user._id});

    if(!studentProfile){
        throw new ApiError(404,"Student profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200,studentProfile,"Student details fetched successfully")
    );
});

const UpdateStudentDetails=asynchandler(async(req,res)=>{
    const {branch, college, year}=req.body;

    // Check if student profile exists
    const studentProfile=await Student.findOne({userId:req.user._id});
    
    if(!studentProfile){
        throw new ApiError(404,"Student profile not found. Please create a profile first.");
    }

    // Build update object with only provided fields
    const updateFields={};
    if(branch) updateFields.branch=branch;
    if(college) updateFields.college=college;
    if(year) updateFields.year=year;

    // Handle verification document update if new file is uploaded
    const verificationDocPath=req.file?.path;
    
    if(verificationDocPath){
        // Upload new verification document
        const verificationDoc=await uploadOnCloudinary(verificationDocPath);
        
        if(!verificationDoc){
            throw new ApiError(500,"Failed to upload verification document");
        }

        // Delete old verification document from Cloudinary
        if(studentProfile.verificationDocument){
            await DeletefromCloudinary(studentProfile.verificationDocument);
        }

        updateFields.verificationDocument=verificationDoc.url;
        // Reset status to PENDING if verification document is updated
        updateFields.status="PENDING";
    }

    // Update student profile
    const updatedProfile=await Student.findByIdAndUpdate(
        studentProfile._id,
        {$set:updateFields},
        {new:true}
    ).populate('userId','name email username profilePicture');

    return res.status(200).json(
        new ApiResponse(200,updatedProfile,"Student details updated successfully")
    );
});

export {CreateStudentProfile,GetStudentDetails,UpdateStudentDetails};

