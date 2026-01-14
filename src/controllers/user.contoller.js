import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {DeletefromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const RegisterUser=asynchandler(async(req,res)=>{
    const {name,email,username,password}=req.body;
    if(!name || !email || !username || !password){
        throw new ApiError(400,"All fields are required");
    }
    const user=await User.findOne({email});
    if(user){
        throw new ApiError(400,"User already exists");
    }
    const profileImagePath=req.file?.path;
    let profileImageUrl;
    if(!profileImagePath){
        profileImageUrl="https://res.cloudinary.com/djgacxxqf/image/upload/v1768371178/a309ed3530e0f365781d8c2607ac4e7e_xs8f5m.jpg";
    }
    else{
        const profileImage=await uploadOnCloudinary(profileImagePath);
        if(!profileImage){
            throw new ApiError(500, "Failed to upload profile image");
        }
        profileImageUrl = profileImage.url;
    }

    const newUser = await User.create({
        name,
        email,
        username,
        password,
        profileImage: profileImageUrl
    });

    const createdUser = await User.findById(newUser._id).select("-password");

    if(!createdUser ){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const generateAccessandRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({ validateBeforeSave: false });
        return {accessToken,refreshToken};
    }catch(err){
        throw new ApiError(500,"Could not generate tokens");
    }
}

const LoginUser=asynchandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        throw new ApiError(400,"All fields are required");
    }
    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(400,"User not found");
    }
    const isPasswordCorrect=await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Incorrect password");
    }
    const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);
    const options={
        httpOnly:true,
        secure:true}
    const LoggedinUser=await User.findById(user._id).select("-password -refreshToken");
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,LoggedinUser,"User logged in successfully")); 
})

const LogoutUser=asynchandler(async(req,res)=>{
    //get user id
    //delete both refresh tokens and access tokens
    const userId=req.user._id;
    await User.findByIdAndUpdate(userId,{
        $set:{refreshToken:undefined}},
        {new:true}
    );
    const options={
        httpOnly:true,
        secure:true,}
    return res.status(200).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"User logged out successfully"));
});

const RefreshAccessToken=asynchandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }

    try{
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        
        const user=await User.findById(decodedToken?._id);
        
        if(!user){
            throw new ApiError(401,"Invalid refresh token");
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used");
        }

        const {accessToken,refreshToken:newRefreshToken}=await generateAccessandRefreshToken(user._id);

        const options={
            httpOnly:true,
            secure:true
        }

        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access token refreshed"));

    }catch(err){
        throw new ApiError(401,err?.message || "Invalid refresh token");
    }
});


const ChangePassword=asynchandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    
    if(!oldPassword || !newPassword){
        throw new ApiError(400,"All fields are required");
    }

    const user=await User.findById(req.user?._id);
    
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,{},"Password changed successfully")
    );
});

const GetCurrentUser=asynchandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,req.user,"Current user fetched successfully")
    );
});

const UpdateAccountDetails=asynchandler(async(req,res)=>{
    const {name,email,username}=req.body;

    if(!name && !email && !username){
        throw new ApiError(400,"At least one field is required");
    }

    const updateFields={};
    if(name) updateFields.name=name;
    if(email) updateFields.email=email;
    if(username) updateFields.username=username;

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {$set:updateFields},
        {new:true}
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200,user,"Account details updated successfully")
    );
});

const UpdateProfilePhoto=asynchandler(async(req,res)=>{
    const profileImagePath=req.file?.path;

    if(!profileImagePath){
        throw new ApiError(400,"Profile image file is required");
    }

    // Upload new image to Cloudinary
    const profileImage=await uploadOnCloudinary(profileImagePath);

    if(!profileImage){
        throw new ApiError(500,"Failed to upload profile image");
    }

    // Get old profile image URL to delete it
    const user=await User.findById(req.user?._id);
    const oldProfileImageUrl=user.profilePicture;

    // Update user with new profile image URL
    const updatedUser=await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{profilePicture:profileImage.url}},
        {new:true}
    ).select("-password -refreshToken");

    // Delete old image from Cloudinary if it exists and is not the default image
    if(oldProfileImageUrl && !oldProfileImageUrl.includes("a309ed3530e0f365781d8c2607ac4e7e")){
        await DeletefromCloudinary(oldProfileImageUrl);
    }

    return res.status(200).json(
        new ApiResponse(200,updatedUser,"Profile photo updated successfully")
    );
});



export {RegisterUser,LoginUser,LogoutUser,RefreshAccessToken,ChangePassword,GetCurrentUser,UpdateAccountDetails,UpdateProfilePhoto};
