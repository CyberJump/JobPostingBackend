import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asynchandler.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Application} from "../models/application.models.js";
import {Job} from "../models/job.models.js";
import {Company} from "../models/company.models.js";
import {uploadDocumentOnCloudinary} from "../utils/cloudinary.js";

const SubmitApplication=asynchandler(async(req,res)=>{
    const {jobId,additionalDocuments}=req.body;
    
    // Validate required fields
    if(!jobId){
        throw new ApiError(400,"Job ID is required");
    }
    
    if(!isValidObjectId(jobId)){
        throw new ApiError(400,"Invalid job ID");
    }
    
    // Check if job exists and is active
    const job=await Job.findById(jobId).populate('company');
    
    if(!job){
        throw new ApiError(404,"Job not found");
    }
    
    // Check if company is BLOCKED
    if(job.company?.status==="BLOCKED"){
        throw new ApiError(400,"This job posting is no longer available");
    }
    
    if(job.status!=="ACTIVE"){
        throw new ApiError(400,"This job posting is no longer active");
    }
    
    // Check if application deadline has passed
    if(job.applicationDeadline && new Date()>new Date(job.applicationDeadline)){
        throw new ApiError(400,"Application deadline has passed");
    }
    
    // Check if user has already applied for this job
    const existingApplication=await Application.findOne({
        job:jobId,
        student:req.user._id
    });
    
    if(existingApplication){
        throw new ApiError(400,"You have already applied for this job");
    }
    
    // Upload resume to Cloudinary if file is provided
    let resumeUrl = null;
    if(req.file){
        const uploadResult = await uploadDocumentOnCloudinary(req.file.path);
        if(uploadResult){
            resumeUrl = uploadResult.secure_url || uploadResult.url;
        }
    }
    
    // Create application
    const application=await Application.create({
        job:jobId,
        student:req.user._id,
        company:job.company._id,
        resumeUrl:resumeUrl || undefined,
        additionalDocuments:additionalDocuments || [],
        status:"APPLIED"
    });
    
    const createdApplication=await Application.findById(application._id)
        .populate('job','title location salary jobType')
        .populate('company','name email Logo')
        .populate('student','name email username profilePicture');
    
    return res.status(201).json(
        new ApiResponse(201,createdApplication,"Application submitted successfully")
    );
});

const DeleteApplication=asynchandler(async(req,res)=>{
    const {applicationId}=req.params;
    
    // Validate applicationId
    if(!isValidObjectId(applicationId)){
        throw new ApiError(400,"Invalid application ID");
    }
    
    // Find the application
    const application=await Application.findById(applicationId);
    
    if(!application){
        throw new ApiError(404,"Application not found");
    }
    
    // Authorization: Only the user who created the application can delete it
    if(application.student.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this application");
    }
    
    // Check if application was created within the last 24 hours
    const createdAt=new Date(application.createdAt);
    const now=new Date();
    const hoursDifference=(now-createdAt)/(1000*60*60);
    
    if(hoursDifference>24){
        throw new ApiError(403,"Applications can only be deleted within 24 hours of submission");
    }
    
    // Delete the application
    await Application.findByIdAndDelete(applicationId);
    
    return res.status(200).json(
        new ApiResponse(200,{},"Application deleted successfully")
    );
});

const GetJobApplications=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    const {page=1,limit=10,status}=req.query;
    
    // Validate jobId
    if(!isValidObjectId(jobId)){
        throw new ApiError(400,"Invalid job ID");
    }
    
    // Find the job and populate company with founders
    const job=await Job.findById(jobId).populate({
        path:'company',
        populate:{path:'founders.userId'}
    });
    
    if(!job){
        throw new ApiError(404,"Job not found");
    }
    
    // Authorization: Only company founders or admin can view applications
    const isFounder=job.company?.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(req.user.role!=="ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to view applications for this job");
    }
    
    // Build match stage
    const matchStage={job:new mongoose.Types.ObjectId(jobId)};
    
    // Filter by status if provided
    if(status){
        if(!["APPLIED","SHORTLISTED","OFFER","REJECTED"].includes(status)){
            throw new ApiError(400,"Invalid status. Must be APPLIED, SHORTLISTED, OFFER, or REJECTED");
        }
        matchStage.status=status;
    }
    
    // Build aggregation pipeline
    const aggregate=Application.aggregate([
        {$match:matchStage},
        {$sort:{createdAt:-1}},
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
                additionalDocuments:1,
                createdAt:1,
                updatedAt:1,
                'student._id':1,
                'student.name':1,
                'student.email':1,
                'student.username':1,
                'student.profilePicture':1,
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

const GetUserApplications=asynchandler(async(req,res)=>{
    const {page=1,limit=10,status}=req.query;
    
    // Build match stage
    const matchStage={student:req.user._id};
    
    // Filter by status if provided
    if(status){
        if(!["APPLIED","SHORTLISTED","OFFER","REJECTED"].includes(status)){
            throw new ApiError(400,"Invalid status. Must be APPLIED, SHORTLISTED, OFFER, or REJECTED");
        }
        matchStage.status=status;
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
        // Filter out BLOCKED companies
        {
            $match:{
                'company.status':{$ne:'BLOCKED'}
            }
        },
        {
            $project:{
                status:1,
                resumeUrl:1,
                additionalDocuments:1,
                createdAt:1,
                updatedAt:1,
                'job._id':1,
                'job.title':1,
                'job.location':1,
                'job.salary':1,
                'job.jobType':1,
                'job.status':1,
                'company._id':1,
                'company.name':1,
                'company.email':1,
                'company.Logo':1
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
        new ApiResponse(200,applications,"Your applications fetched successfully")
    );
});

const GetApplicationStatus=asynchandler(async(req,res)=>{
    const {applicationId}=req.params;
    
    // Validate applicationId
    if(!isValidObjectId(applicationId)){
        throw new ApiError(400,"Invalid application ID");
    }
    
    // Find application and populate related data
    const application=await Application.findById(applicationId)
        .populate('job','title description location salary jobType status applicationDeadline')
        .populate('company','name email description website Logo status')
        .populate('student','name email username profilePicture')
        .populate('reviewedBy','name email');
    
    if(!application){
        throw new ApiError(404,"Application not found");
    }
    
    // Check if company is BLOCKED
    if(application.company?.status==="BLOCKED"){
        throw new ApiError(404,"Application not found");
    }
    
    // Authorization: Only the user who submitted the application can view its status
    if(application.student._id.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to view this application");
    }
    
    return res.status(200).json(
        new ApiResponse(200,application,"Application status fetched successfully")
    );
});

const ReviewApplication=asynchandler(async(req,res)=>{
    const {applicationId}=req.params;
    const {status,offerLetterUrl}=req.body;
    
    // Validate applicationId
    if(!isValidObjectId(applicationId)){
        throw new ApiError(400,"Invalid application ID");
    }
    
    // Validate status
    if(!status){
        throw new ApiError(400,"Status is required");
    }
    
    if(!["SHORTLISTED","OFFER","REJECTED"].includes(status)){
        throw new ApiError(400,"Status must be SHORTLISTED, OFFER, or REJECTED");
    }
    
    // If status is OFFER, offer letter URL is required
    if(status==="OFFER" && !offerLetterUrl){
        throw new ApiError(400,"Offer letter URL is required when status is OFFER");
    }
    
    // Find the application and populate job with company
    const application=await Application.findById(applicationId)
        .populate({
            path:'job',
            populate:{
                path:'company',
                populate:{path:'founders.userId'}
            }
        });
    
    if(!application){
        throw new ApiError(404,"Application not found");
    }
    
    // Authorization: Only company founders or admin can review applications
    const isFounder=application.job?.company?.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(req.user.role!=="ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to review this application");
    }
    
    // Build update object
    const updateFields={
        status,
        reviewedBy:req.user._id
    };
    
    // Add offer letter URL if status is OFFER
    if(status==="OFFER"){
        updateFields.offerLetterUrl=offerLetterUrl;
    }
    
    // Update application
    const updatedApplication=await Application.findByIdAndUpdate(
        applicationId,
        {$set:updateFields},
        {new:true}
    ).populate('job','title location salary jobType')
     .populate('company','name email Logo')
     .populate('student','name email username profilePicture')
     .populate('reviewedBy','name email username');
    
    return res.status(200).json(
        new ApiResponse(200,updatedApplication,`Application ${status.toLowerCase()} successfully`)
    );
});

export {
    SubmitApplication,
    DeleteApplication,
    GetJobApplications,
    GetUserApplications,
    GetApplicationStatus,
    ReviewApplication
};
