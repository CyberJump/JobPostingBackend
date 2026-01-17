import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import mongoose, { isValidObjectId } from "mongoose"
import {Job} from "../models/job.models.js"

const CreateJobPosting=asynchandler(async(req,res)=>{
    // Extract job details from request body
    const {
        title,
        company,
        description,
        requirements,
        location,
        salary,
        jobType,
        applicationDeadline
    }=req.body;

    // Validate required fields
    if(!title || !company || !description || !requirements || !location || !salary || !jobType){
        throw new ApiError(400,"Title, company, description, requirements, location, salary, and job type are required");
    }

    // Validate jobType enum
    if(!["FULLTIME","INTERNSHIP"].includes(jobType)){
        throw new ApiError(400,"Job type must be either FULLTIME or INTERNSHIP");
    }

    // Parse requirements if it's a string
    let requirementsArray=requirements;
    if(typeof requirements === 'string'){
        requirementsArray=requirements.split(',').map(req=>req.trim());
    }

    // Create job posting with ACTIVE status
    const jobPosting=await Job.create({
        title,
        company,
        description,
        requirements:requirementsArray,
        location,
        salary,
        jobType,
        createdBy:req.user._id,
        applicationDeadline:applicationDeadline || undefined,
        status:"ACTIVE"
    });

    const createdJob=await Job.findById(jobPosting._id)
        .populate('company','name email')
        .populate('createdBy','name email username');

    if(!createdJob){
        throw new ApiError(500,"Failed to create job posting");
    }

    return res.status(201).json(
        new ApiResponse(200,createdJob,"Job posting created successfully")
    );
});

const UpdateJobPosting=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    
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
        throw new ApiError(404,"Job posting not found");
    }

    // Authorization check: Only admin or company founder can update
    const isFounder=job.company?.founders?.userId?.toString() === req.user._id.toString();
    if(req.user.role !== "ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to update this job posting");
    }

    // Extract update fields
    const {
        title,
        description,
        requirements,
        location,
        salary,
        jobType,
        applicationDeadline
    }=req.body;

    // Build update object with only provided fields
    const updateFields={};
    if(title) updateFields.title=title;
    if(description) updateFields.description=description;
    if(location) updateFields.location=location;
    if(salary) updateFields.salary=salary;
    if(applicationDeadline) updateFields.applicationDeadline=applicationDeadline;
    
    // Validate and update jobType if provided
    if(jobType){
        if(!["FULLTIME","INTERNSHIP"].includes(jobType)){
            throw new ApiError(400,"Job type must be either FULLTIME or INTERNSHIP");
        }
        updateFields.jobType=jobType;
    }

    // Parse requirements if provided
    if(requirements){
        let requirementsArray=requirements;
        if(typeof requirements === 'string'){
            requirementsArray=requirements.split(',').map(req=>req.trim());
        }
        updateFields.requirements=requirementsArray;
    }

    // Update job posting
    const updatedJob=await Job.findByIdAndUpdate(
        jobId,
        {$set:updateFields},
        {new:true}
    ).populate('company','name email').populate('createdBy','name email username');

    return res.status(200).json(
        new ApiResponse(200,updatedJob,"Job posting updated successfully")
    );
});

const CloseJobPosting=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    
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
        throw new ApiError(404,"Job posting not found");
    }

    // Authorization check: Only admin or company founder can close
    const isFounder=job.company?.founders?.userId?.toString() === req.user._id.toString();
    if(req.user.role !== "ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to close this job posting");
    }

    // Update status to INACTIVE
    const closedJob=await Job.findByIdAndUpdate(
        jobId,
        {$set:{status:"INACTIVE"}},
        {new:true}
    ).populate('company','name email').populate('createdBy','name email username');

    return res.status(200).json(
        new ApiResponse(200,closedJob,"Job posting closed successfully")
    );
});

const DeleteJobPosting=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    
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
        throw new ApiError(404,"Job posting not found");
    }

    // Authorization check: Only admin or company founder can delete
    const isFounder=job.company?.founders?.userId?.toString() === req.user._id.toString();
    if(req.user.role !== "ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to delete this job posting");
    }

    // Delete the job posting
    await Job.findByIdAndDelete(jobId);

    return res.status(200).json(
        new ApiResponse(200,{},"Job posting deleted successfully")
    );
});

const GetJobDetails=asynchandler(async(req,res)=>{
    const {jobId}=req.params;
    
    // Validate jobId
    if(!isValidObjectId(jobId)){
        throw new ApiError(400,"Invalid job ID");
    }

    // Find job and populate related data
    const job=await Job.findById(jobId)
        .populate('company','name email description website Logo status')
        .populate('createdBy','name email username');
    
    if(!job){
        throw new ApiError(404,"Job posting not found");
    }
    
    // Check if company is BLOCKED
    if(job.company?.status==="BLOCKED"){
        throw new ApiError(404,"Job posting not found");
    }

    return res.status(200).json(
        new ApiResponse(200,job,"Job details fetched successfully")
    );
});

const GetAllJobs=asynchandler(async(req,res)=>{
    const {
        page=1,
        limit=10,
        status,
        sortBy='newest',
        jobType,
        search
    }=req.query;

    // Build match stage for aggregation
    const matchStage={};
    
    // Filter by status (ACTIVE/INACTIVE)
    if(status){
        if(!["ACTIVE","INACTIVE"].includes(status)){
            throw new ApiError(400,"Status must be either ACTIVE or INACTIVE");
        }
        matchStage.status=status;
    }
    
    // Filter by job type
    if(jobType){
        if(!["FULLTIME","INTERNSHIP"].includes(jobType)){
            throw new ApiError(400,"Job type must be either FULLTIME or INTERNSHIP");
        }
        matchStage.jobType=jobType;
    }
    
    // Search by title or description
    if(search){
        matchStage.$or=[
            {title:{$regex:search,$options:'i'}},
            {description:{$regex:search,$options:'i'}}
        ];
    }

    // Date filtering logic
    const { includeExpired } = req.query;
    const currentDate = new Date();
    
    // Determine user role safely (default to GUEST/STUDENT if not logged in)
    const userRole = req.user?.role || "STUDENT";

    // Automatic filtering for COMPANY users to see their own jobs
    // If user is COMPANY and not explicitly searching/filtering by status, default to their own jobs
    if(userRole === "COMPANY" && !status && !search && !jobType) {
         matchStage.createdBy = req.user._id;
    }

    // Students and Guests can NEVER see expired jobs
    if (userRole === "STUDENT") {
        matchStage.$or = [
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: null },
            { applicationDeadline: { $gte: currentDate } }
        ];
        // Merge with search if it exists
        if(search) {
            matchStage.$and = [
                { $or: [
                    {title:{$regex:search,$options:'i'}},
                    {description:{$regex:search,$options:'i'}}
                ]},
                { $or: [
                    { applicationDeadline: { $exists: false } },
                    { applicationDeadline: null },
                    { applicationDeadline: { $gte: currentDate } }
                ]}
            ];
            delete matchStage.$or; // Removed top-level $or to avoid conflict
        }
    } 
    // Companies/Admins filter by default, unless includeExpired is strictly 'true'
    else if (includeExpired !== 'true') {
        const dateFilter = [
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: null },
            { applicationDeadline: { $gte: currentDate } }
        ];

        if(search) {
            matchStage.$and = [
                { $or: [
                    {title:{$regex:search,$options:'i'}},
                    {description:{$regex:search,$options:'i'}}
                ]},
                { $or: dateFilter }
            ];
            delete matchStage.$or;
        } else {
            matchStage.$or = dateFilter;
        }
    }

    // Build sort stage
    let sortStage={};
    switch(sortBy){
        case 'newest':
            sortStage={createdAt:-1};
            break;
        case 'oldest':
            sortStage={createdAt:1};
            break;
        case 'salary-high':
            sortStage={salary:-1};
            break;
        case 'salary-low':
            sortStage={salary:1};
            break;
        default:
            sortStage={createdAt:-1};
    }

    // Build aggregation pipeline
    const aggregate=Job.aggregate([
        {$match:matchStage},
        {$sort:sortStage},
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
        // Filter out BLOCKED companies and users
        {
            $match:{
                'company.status':{$ne:'BLOCKED'},
                'createdBy.status':{$ne:'BLOCKED'}
            }
        },
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
                'company.Logo':1,
                'createdBy._id':1,
                'createdBy.name':1,
                'createdBy.email':1,
                'createdBy.username':1
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



export {CreateJobPosting,UpdateJobPosting,CloseJobPosting,DeleteJobPosting,GetJobDetails,GetAllJobs};

