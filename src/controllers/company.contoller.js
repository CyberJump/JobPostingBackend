import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asynchandler.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Company} from "../models/company.models.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary, DeletefromCloudinary } from "../utils/cloudinary.js";

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
    // Status defaults to PENDING per model definition (requires admin approval)
    const company=await Company.create({
        name,
        email,
        description,
        website:website || undefined,
        Logo:Logo || undefined,
        founders:[{
            userId:req.user._id
        }]
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
    const {name,email,description,website}=req.body;
    let {Logo}=req.body;
    
    // Handle File Upload if present
    const logoLocalPath = req.file?.path;
    if (logoLocalPath) {
        const cloudinaryResponse = await uploadOnCloudinary(logoLocalPath);
        if (cloudinaryResponse) {
            if (company.Logo && company.Logo.includes("cloudinary.com")) {
                const parts = company.Logo.split("/");
                const fileName = parts[parts.length - 1];
                const publicId = fileName.split(".")[0];
                await DeletefromCloudinary(publicId);
            }
            Logo = cloudinaryResponse.url;
        }
    }

    // Build update object
    const updateFields={};
    if(name) updateFields.name=name;
    if(description) updateFields.description=description;
    if(website!==undefined) updateFields.website=website;
    if(Logo!==undefined) updateFields.Logo=Logo;
    
    // Email update check
    if(email && email!==company.email){
        const existingCompany=await Company.findOne({email});
        if(existingCompany){
            throw new ApiError(400,"Company with this email already exists");
        }
        updateFields.email=email;
    }
    
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
    
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    const company=await Company.findById(companyId).populate('founders.userId');
    if(!company) throw new ApiError(404,"Company not found");
    
    const isFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(req.user.role!=="ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to withdraw this company");
    }
    
    await Company.findByIdAndDelete(companyId);
    
    return res.status(200).json(new ApiResponse(200,{},"Company withdrawn successfully"));
});

const GetCompanyDetails=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    if(!isValidObjectId(companyId)) throw new ApiError(400,"Invalid company ID");
    
    const company=await Company.findById(companyId)
        .populate('founders.userId','name email username profilePicture')
        .populate('approvedBy','name email');
    
    if(!company || company.status==="BLOCKED") throw new ApiError(404,"Company not found");
    
    return res.status(200).json(new ApiResponse(200,company,"Company details fetched successfully"));
});

const GetAllCompanies=asynchandler(async(req,res)=>{
    const {page=1,limit=10,status,search,myCompanies}=req.query;
    const matchStage={};

    // Filter by myCompanies (Authorization Hardening)
    // STRICTLY enforce for COMPANY role to prevent accessing others' data
    if (req.user?.role === "COMPANY") {
        matchStage['founders.userId'] = req.user._id;
    } 
    // For ADMIN or others, allow optional filtering
    else if(myCompanies === 'true' && req.user){
        matchStage['founders.userId'] = req.user._id;
    }

    if(status){
        if(!["ACTIVE","PENDING","BLOCKED"].includes(status)) throw new ApiError(400,"Invalid status");
        matchStage.status=status;
    } else matchStage.status={$ne:"BLOCKED"};
    
    if(search){
        matchStage.$or=[{name:{$regex:search,$options:'i'}},{description:{$regex:search,$options:'i'}}];
    }
    
    const aggregate=Company.aggregate([
        {$match:matchStage},
        {$sort:{createdAt:-1}},
        {$lookup:{from:'users',localField:'founders.userId',foreignField:'_id',as:'populatedFounders'}},
        {
            $project:{
                name:1,email:1,description:1,website:1,Logo:1,status:1,createdAt:1,updatedAt:1,
                founders:{
                    $map:{
                        input:"$founders",as:"f",in:{
                            userId:{$arrayElemAt:[{$filter:{input:"$populatedFounders",as:"pf",cond:{$eq:["$$pf._id","$$f.userId"]}}},0]}
                        }
                    }
                }
            }
        },
        {$project:{"founders.userId.password":0,"founders.userId.refreshToken":0}}
    ]);
    
    const companies=await Company.aggregatePaginate(aggregate,{page:parseInt(page),limit:parseInt(limit)});
    return res.status(200).json(new ApiResponse(200,companies,"Companies fetched successfully"));
});

// Protected function for company dashboard - strictly returns only user's companies
const GetMyCompanies=asynchandler(async(req,res)=>{
    const {page=1,limit=10}=req.query;
    
    // Strictly filter by the authenticated user's ID
    const matchStage = {
        'founders.userId': req.user._id,
        status: { $ne: "BLOCKED" }
    };
    
    const aggregate=Company.aggregate([
        {$match:matchStage},
        {$sort:{createdAt:-1}},
        {$lookup:{from:'users',localField:'founders.userId',foreignField:'_id',as:'populatedFounders'}},
        {
            $project:{
                name:1,email:1,description:1,website:1,Logo:1,status:1,createdAt:1,updatedAt:1,
                founders:{
                    $map:{
                        input:"$founders",as:"f",in:{
                            userId:{$arrayElemAt:[{$filter:{input:"$populatedFounders",as:"pf",cond:{$eq:["$$pf._id","$$f.userId"]}}},0]}
                        }
                    }
                }
            }
        },
        {$project:{"founders.userId.password":0,"founders.userId.refreshToken":0}}
    ]);
    
    const companies=await Company.aggregatePaginate(aggregate,{page:parseInt(page),limit:parseInt(limit)});
    return res.status(200).json(new ApiResponse(200,companies,"Your companies fetched successfully"));
});

export {RegisterCompany,UpdateCompanyDetails,WithdrawCompany,GetCompanyDetails,GetAllCompanies,GetMyCompanies};
