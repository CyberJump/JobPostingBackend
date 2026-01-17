import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asynchandler.js";
import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.models.js";
import {Company} from "../models/company.models.js";
import {Job} from "../models/job.models.js";
import {Application} from "../models/application.models.js";

// ==================== USER MANAGEMENT ====================

const CreateAdmin=asynchandler(async(req,res)=>{
    const {name,username,email,password}=req.body;
    
    // Validate required fields
    if(!name || !username || !email || !password){
        throw new ApiError(400,"All fields are required");
    }
    
    // Check if user already exists
    const existingUser=await User.findOne({
        $or:[{email},{username}]
    });
    
    if(existingUser){
        throw new ApiError(400,"User with this email or username already exists");
    }
    
    // Create admin user
    const admin=await User.create({
        name,
        username,
        email,
        password,
        role:"ADMIN",
        status:"ACTIVE"
    });
    
    const createdAdmin=await User.findById(admin._id).select("-password -refreshToken");
    
    return res.status(201).json(
        new ApiResponse(201,createdAdmin,"Admin user created successfully")
    );
});

const RemoveAdmin=asynchandler(async(req,res)=>{
    const {userId}=req.params;
    
    // Validate userId
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user ID");
    }
    
    // Find the user
    const user=await User.findById(userId);
    
    if(!user){
        throw new ApiError(404,"User not found");
    }
    
    // Check if user is an admin
    if(user.role!=="ADMIN"){
        throw new ApiError(400,"User is not an admin");
    }
    
    // Prevent removing yourself
    if(user._id.toString()===req.user._id.toString()){
        throw new ApiError(400,"You cannot remove your own admin privileges");
    }
    
    // Change role to STUDENT
    const updatedUser=await User.findByIdAndUpdate(
        userId,
        {$set:{role:"STUDENT"}},
        {new:true}
    ).select("-password -refreshToken");
    
    return res.status(200).json(
        new ApiResponse(200,updatedUser,"Admin privileges removed successfully")
    );
});

const BlockUser=asynchandler(async(req,res)=>{
    const {userId}=req.params;
    
    // Validate userId
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user ID");
    }
    
    // Find the user
    const user=await User.findById(userId);
    
    if(!user){
        throw new ApiError(404,"User not found");
    }
    
    // Prevent blocking yourself
    if(user._id.toString()===req.user._id.toString()){
        throw new ApiError(400,"You cannot block yourself");
    }
    
    // Prevent blocking other admins
    if(user.role==="ADMIN"){
        throw new ApiError(400,"Cannot block admin users. Remove admin privileges first.");
    }
    
    // Block the user
    const blockedUser=await User.findByIdAndUpdate(
        userId,
        {$set:{status:"BLOCKED"}},
        {new:true}
    ).select("-password -refreshToken");
    
    return res.status(200).json(
        new ApiResponse(200,blockedUser,"User blocked successfully")
    );
});

const UnblockUser=asynchandler(async(req,res)=>{
    const {userId}=req.params;
    
    // Validate userId
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user ID");
    }
    
    // Unblock the user
    const unblockedUser=await User.findByIdAndUpdate(
        userId,
        {$set:{status:"ACTIVE"}},
        {new:true}
    ).select("-password -refreshToken");
    
    if(!unblockedUser){
        throw new ApiError(404,"User not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,unblockedUser,"User unblocked successfully")
    );
});

const BlockCompany=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    
    // Validate companyId
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Block the company
    const blockedCompany=await Company.findByIdAndUpdate(
        companyId,
        {$set:{status:"BLOCKED",approvedBy:req.user._id}},
        {new:true}
    ).populate('founders.userId','name email username');
    
    if(!blockedCompany){
        throw new ApiError(404,"Company not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,blockedCompany,"Company blocked successfully")
    );
});

const UnblockCompany=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    
    // Validate companyId
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Unblock the company
    const unblockedCompany=await Company.findByIdAndUpdate(
        companyId,
        {$set:{status:"ACTIVE",approvedBy:req.user._id}},
        {new:true}
    ).populate('founders.userId','name email username');
    
    if(!unblockedCompany){
        throw new ApiError(404,"Company not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,unblockedCompany,"Company unblocked successfully")
    );
});

const GetAllUsers=asynchandler(async(req,res)=>{
    const {page=1,limit=20,role,status,search}=req.query;
    
    // Build match criteria
    const matchCriteria={};
    
    // Filter by role
    if(role){
        if(!["STUDENT","COMPANY","ADMIN"].includes(role)){
            throw new ApiError(400,"Invalid role. Must be STUDENT, COMPANY, or ADMIN");
        }
        matchCriteria.role=role;
    }
    
    // Filter by status
    if(status){
        if(!["ACTIVE","BLOCKED"].includes(status)){
            throw new ApiError(400,"Invalid status. Must be ACTIVE or BLOCKED");
        }
        matchCriteria.status=status;
    }
    
    // Search by name, email, or username
    if(search){
        matchCriteria.$or=[
            {name:{$regex:search,$options:'i'}},
            {email:{$regex:search,$options:'i'}},
            {username:{$regex:search,$options:'i'}}
        ];
    }
    
    // Get users with pagination
    const skip=(parseInt(page)-1)*parseInt(limit);
    
    const users=await User.find(matchCriteria)
        .select("-password -refreshToken")
        .sort({createdAt:-1})
        .skip(skip)
        .limit(parseInt(limit));
    
    const totalUsers=await User.countDocuments(matchCriteria);
    
    const response={
        users,
        pagination:{
            currentPage:parseInt(page),
            totalPages:Math.ceil(totalUsers/parseInt(limit)),
            totalUsers,
            usersPerPage:parseInt(limit)
        }
    };
    
    return res.status(200).json(
        new ApiResponse(200,response,"Users fetched successfully")
    );
});


const GetAllApplicationsAdmin=asynchandler(async(req,res)=>{
    const {page=1,limit=20,status,jobId,companyId}=req.query;
    
    // Build match stage
    const matchStage={};
    
    // Filter by status
    if(status){
        if(!["APPLIED","SHORTLISTED","OFFER","REJECTED"].includes(status)){
            throw new ApiError(400,"Invalid status");
        }
        matchStage.status=status;
    }
    
    // Filter by job
    if(jobId){
        if(!isValidObjectId(jobId)){
            throw new ApiError(400,"Invalid job ID");
        }
        matchStage.job=new mongoose.Types.ObjectId(jobId);
    }
    
    // Filter by company
    if(companyId){
        if(!isValidObjectId(companyId)){
            throw new ApiError(400,"Invalid company ID");
        }
        matchStage.company=new mongoose.Types.ObjectId(companyId);
    }
    
    // Build aggregation pipeline
    const aggregate=Application.aggregate([
        {$match:matchStage},
        {$sort:{createdAt:-1}},
        {
            $lookup:{
                from:'jobs',
                localField:'job',
                foreignField:'_id',
                as:'job'
            }
        },
        {$unwind:{path:'$job',preserveNullAndEmptyArrays:true}},
        {
            $lookup:{
                from:'companies',
                localField:'company',
                foreignField:'_id',
                as:'company'
            }
        },
        {$unwind:{path:'$company',preserveNullAndEmptyArrays:true}},
        {
            $lookup:{
                from:'users',
                localField:'student',
                foreignField:'_id',
                as:'student'
            }
        },
        {$unwind:{path:'$student',preserveNullAndEmptyArrays:true}},
        {
            $lookup:{
                from:'users',
                localField:'reviewedBy',
                foreignField:'_id',
                as:'reviewedBy'
            }
        },
        {$unwind:{path:'$reviewedBy',preserveNullAndEmptyArrays:true}},
        {
            $project:{
                status:1,
                resumeUrl:1,
                offerLetterUrl:1,
                additionalDocuments:1,
                createdAt:1,
                updatedAt:1,
                'job._id':1,
                'job.title':1,
                'job.status':1,
                'company._id':1,
                'company.name':1,
                'company.status':1,
                'student._id':1,
                'student.name':1,
                'student.email':1,
                'student.status':1,
                'reviewedBy._id':1,
                'reviewedBy.name':1,
                'reviewedBy.email':1
            }
        }
    ]);
    
    // Apply pagination
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    };
    
    const applications=await Application.aggregatePaginate(aggregate,options);
    
    return res.status(200).json(
        new ApiResponse(200,applications,"Applications fetched successfully")
    );
});

const DeleteApplicationAdmin=asynchandler(async(req,res)=>{
    const {applicationId}=req.params;
    
    // Validate applicationId
    if(!isValidObjectId(applicationId)){
        throw new ApiError(400,"Invalid application ID");
    }
    
    // Delete the application
    const deletedApplication=await Application.findByIdAndDelete(applicationId);
    
    if(!deletedApplication){
        throw new ApiError(404,"Application not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,{},"Application deleted successfully")
    );
});

const GetAllJobsAdmin=asynchandler(async(req,res)=>{
    const {page=1,limit=20,status,jobType,companyId}=req.query;
    
    // Build match stage (no filtering of BLOCKED companies for admin)
    const matchStage={};
    
    // Filter by status
    if(status){
        if(!["ACTIVE","INACTIVE"].includes(status)){
            throw new ApiError(400,"Invalid status");
        }
        matchStage.status=status;
    }
    
    // Filter by job type
    if(jobType){
        if(!["FULLTIME","INTERNSHIP"].includes(jobType)){
            throw new ApiError(400,"Invalid job type");
        }
        matchStage.jobType=jobType;
    }
    
    // Filter by company
    if(companyId){
        if(!isValidObjectId(companyId)){
            throw new ApiError(400,"Invalid company ID");
        }
        matchStage.company=new mongoose.Types.ObjectId(companyId);
    }
    
    // Build aggregation pipeline
    const aggregate=Job.aggregate([
        {$match:matchStage},
        {$sort:{createdAt:-1}},
        {
            $lookup:{
                from:'companies',
                localField:'company',
                foreignField:'_id',
                as:'company'
            }
        },
        {$unwind:{path:'$company',preserveNullAndEmptyArrays:true}},
        {
            $lookup:{
                from:'users',
                localField:'createdBy',
                foreignField:'_id',
                as:'createdBy'
            }
        },
        {$unwind:{path:'$createdBy',preserveNullAndEmptyArrays:true}},
        {
            $project:{
                title:1,
                description:1,
                requirements:1,
                location:1,
                salary:1,
                jobType:1,
                status:1,
                applicationDeadline:1,
                createdAt:1,
                updatedAt:1,
                'company._id':1,
                'company.name':1,
                'company.email':1,
                'company.status':1,
                'createdBy._id':1,
                'createdBy.name':1,
                'createdBy.email':1,
                'createdBy.status':1
            }
        }
    ]);
    
    // Apply pagination
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    };
    
    const jobs=await Job.aggregatePaginate(aggregate,options);
    
    return res.status(200).json(
        new ApiResponse(200,jobs,"Jobs fetched successfully")
    );
});

const ModifyJobAdmin=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    const {title,description,requirements,location,salary,jobType,status,applicationDeadline}=req.body;
    
    // Validate jobId
    if(!isValidObjectId(jobId)){
        throw new ApiError(400,"Invalid job ID");
    }
    
    // Build update object
    const updateFields={};
    if(title) updateFields.title=title;
    if(description) updateFields.description=description;
    if(requirements) updateFields.requirements=requirements;
    if(location) updateFields.location=location;
    if(salary) updateFields.salary=salary;
    if(jobType){
        if(!["FULLTIME","INTERNSHIP"].includes(jobType)){
            throw new ApiError(400,"Invalid job type");
        }
        updateFields.jobType=jobType;
    }
    if(status){
        if(!["ACTIVE","INACTIVE"].includes(status)){
            throw new ApiError(400,"Invalid status");
        }
        updateFields.status=status;
    }
    if(applicationDeadline) updateFields.applicationDeadline=applicationDeadline;
    
    // Update job
    const updatedJob=await Job.findByIdAndUpdate(
        jobId,
        {$set:updateFields},
        {new:true}
    ).populate('company','name email')
     .populate('createdBy','name email username');
    
    if(!updatedJob){
        throw new ApiError(404,"Job not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,updatedJob,"Job updated successfully")
    );
});

const DeleteJobAdmin=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    
    // Validate jobId
    if(!isValidObjectId(jobId)){
        throw new ApiError(400,"Invalid job ID");
    }
    
    // Delete the job
    const deletedJob=await Job.findByIdAndDelete(jobId);
    
    if(!deletedJob){
        throw new ApiError(404,"Job not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,{},"Job deleted successfully")
    );
});

export {
    // User Management
    CreateAdmin,
    RemoveAdmin,
    BlockUser,
    UnblockUser,
    BlockCompany,
    UnblockCompany,
    GetAllUsers,
    // Content Management
    GetAllApplicationsAdmin,
    DeleteApplicationAdmin,
    GetAllJobsAdmin,
    ModifyJobAdmin,
    DeleteJobAdmin
};
