import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.models.js";

export const verifyJWT=asynchandler(async(req, _,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
        if(!token){
            throw new ApiError(401,"Unauthorized access,token missing");
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).
        select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Unauthorized access,user not found");  
        }
        req.user=user;
        req.role=user.role;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message|| "Unauthorized access,invalid token");
    }
});

export const verifyRole=(role)=>asynchandler(async(req,_,next)=>{
   const user_role=req.role;
   if(!role){
    throw new ApiError(401,"Unauthorized access,role missing");
   } 
   if(user_role!==role){
    throw new ApiError(401,"Unauthorized access,role mismatch");
   }
   next();
})