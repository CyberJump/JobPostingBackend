import {ApiError} from "../utils/ApiError.js";
import {asynchandler} from "../utils/asynchandler.js";

// Middleware to verify admin role
export const verifyAdmin=asynchandler(async(req,_,next)=>{
    if(!req.user){
        throw new ApiError(401,"Unauthorized access");
    }
    
    if(req.user.role!=="ADMIN"){
        throw new ApiError(403,"Admin access required");
    }
    
    next();
});

// Middleware to check if user is not blocked
export const checkNotBlocked=asynchandler(async(req,_,next)=>{
    if(!req.user){
        throw new ApiError(401,"Unauthorized access");
    }
    
    if(req.user.status==="BLOCKED"){
        throw new ApiError(403,"Your account has been blocked. Please contact support.");
    }
    
    next();
});
