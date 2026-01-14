import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asynchandler.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Company} from "../models/company.models.js";
import {User} from "../models/user.models.js";

const RegisterCompany=asynchandler(async(req,res)=>{
    const {name,email,description,website,Logo}=req.body;
    
    // Validate required fields
    if(!name || !email || !description){
        throw new ApiError(400,"Name, email, and description are required");
    }
    
    // Check if company with this email already exists
    const existingCompany=await Company.findOne({email});
    
    if(existingCompany){
        throw new ApiError(400,"Company with this email already exists");
    }
    
    // Create company with the current user as founder
    const company=await Company.create({
        name,
        email,
        description,
        website:website || undefined,
        Logo:Logo || undefined,
        founders:[{
            userId:req.user._id
        }],
        status:"ACTIVE"
    });
    
    const createdCompany=await Company.findById(company._id)
        .populate('founders.userId','name email username profilePicture');
    
    if(!createdCompany){
        throw new ApiError(500,"Failed to register company");
    }
    
    return res.status(201).json(
        new ApiResponse(201,createdCompany,"Company registered successfully")
    );
});

const UpdateCompanyDetails=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    
    // Validate companyId
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Find the company and populate founders
    const company=await Company.findById(companyId).populate('founders.userId');
    
    if(!company){
        throw new ApiError(404,"Company not found");
    }
    
    // Authorization: Only company founders or admin can update
    const isFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(req.user.role!=="ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to update this company");
    }
    
    // Extract update fields
    const {name,email,description,website,Logo}=req.body;
    
    // Build update object with only provided fields
    const updateFields={};
    if(name) updateFields.name=name;
    if(description) updateFields.description=description;
    if(website!==undefined) updateFields.website=website;
    if(Logo!==undefined) updateFields.Logo=Logo;
    
    // Check if email is being updated and if it's already taken
    if(email && email!==company.email){
        const existingCompany=await Company.findOne({email});
        if(existingCompany){
            throw new ApiError(400,"Company with this email already exists");
        }
        updateFields.email=email;
    }
    
    // Update company
    const updatedCompany=await Company.findByIdAndUpdate(
        companyId,
        {$set:updateFields},
        {new:true}
    ).populate('founders.userId','name email username profilePicture')
     .populate('approvedBy','name email');
    
    return res.status(200).json(
        new ApiResponse(200,updatedCompany,"Company details updated successfully")
    );
});

const WithdrawCompany=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    
    // Validate companyId
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Find the company and populate founders
    const company=await Company.findById(companyId).populate('founders.userId');
    
    if(!company){
        throw new ApiError(404,"Company not found");
    }
    
    // Authorization: Only company founders or admin can withdraw
    const isFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(req.user.role!=="ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to withdraw this company");
    }
    
    // Delete the company
    await Company.findByIdAndDelete(companyId);
    
    return res.status(200).json(
        new ApiResponse(200,{},"Company withdrawn successfully")
    );
});

const GetCompanyDetails=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    
    // Validate companyId
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Find company and populate related data
    const company=await Company.findById(companyId)
        .populate('founders.userId','name email username profilePicture')
        .populate('approvedBy','name email');
    
    if(!company){
        throw new ApiError(404,"Company not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200,company,"Company details fetched successfully")
    );
});

const GetAllCompanies=asynchandler(async(req,res)=>{
    const {page=1,limit=10,status,search}=req.query;
    
    // Build match stage
    const matchStage={};
    
    // Filter by status if provided
    if(status){
        if(!["ACTIVE","PENDING","BLOCKED"].includes(status)){
            throw new ApiError(400,"Invalid status. Must be ACTIVE, PENDING, or BLOCKED");
        }
        matchStage.status=status;
    }
    
    // Search by name or description
    if(search){
        matchStage.$or=[
            {name:{$regex:search,$options:'i'}},
            {description:{$regex:search,$options:'i'}}
        ];
    }
    
    // Build aggregation pipeline
    const aggregate=Company.aggregate([
        {$match:matchStage},
        {$sort:{createdAt:-1}},
        {
            $lookup:{
                from:'users',
                localField:'founders.userId',
                foreignField:'_id',
                as:'founderDetails'
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'approvedBy',
                foreignField:'_id',
                as:'approvedBy'
            }
        },
        {$unwind:{path:'$approvedBy',preserveNullAndEmptyArrays:true}},
        {
            $project:{
                name:1,
                email:1,
                description:1,
                website:1,
                Logo:1,
                status:1,
                createdAt:1,
                updatedAt:1,
                founders:1,
                'founderDetails._id':1,
                'founderDetails.name':1,
                'founderDetails.email':1,
                'founderDetails.username':1,
                'approvedBy._id':1,
                'approvedBy.name':1,
                'approvedBy.email':1
            }
        }
    ]);
    
    // Apply pagination
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    };
    
    const companies=await Company.aggregatePaginate(aggregate,options);
    
    return res.status(200).json(
        new ApiResponse(200,companies,"Companies fetched successfully")
    );
});

export {
    RegisterCompany,
    UpdateCompanyDetails,
    WithdrawCompany,
    GetCompanyDetails,
    GetAllCompanies
};
