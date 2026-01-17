import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asynchandler.js";
import mongoose, {isValidObjectId} from "mongoose";
import {CompanyInvite} from "../models/companyinvite.models.js";
import {Company} from "../models/company.models.js";
import {User} from "../models/user.models.js";

const SendFounderInvite=asynchandler(async(req,res)=>{
    const {companyId,email}=req.body;
    
    // Validate required fields
    if(!companyId || !email){
        throw new ApiError(400,"Company ID and email are required");
    }
    
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Find the company and populate founders
    const company=await Company.findById(companyId).populate('founders.userId');
    
    if(!company){
        throw new ApiError(404,"Company not found");
    }
    
    // Check if company is BLOCKED
    if(company.status==="BLOCKED"){
        throw new ApiError(403,"This company is blocked and cannot send invites");
    }
    
    // Authorization: Only existing founders can send invites
    const isFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(!isFounder){
        throw new ApiError(403,"Only company founders can send invites");
    }
    
    // Check if user with this email exists
    const invitedUser=await User.findOne({email});
    
    if(!invitedUser){
        throw new ApiError(404,"User with this email not found");
    }
    
    // Check if user is BLOCKED
    if(invitedUser.status==="BLOCKED"){
        throw new ApiError(400,"Cannot send invite to a blocked user");
    }
    
    // Check if user is already a founder
    const isAlreadyFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===invitedUser._id.toString()
    );
    
    if(isAlreadyFounder){
        throw new ApiError(400,"User is already a founder of this company");
    }
    
    // Check if there's already a pending invite for this user
    const existingInvite=await CompanyInvite.findOne({
        companyId,
        email,
        status:"PENDING"
    });
    
    if(existingInvite){
        throw new ApiError(400,"A pending invite already exists for this user");
    }
    
    // Create invite with 7 days expiration
    const expirationDate=new Date();
    expirationDate.setDate(expirationDate.getDate()+7);
    
    const invite=await CompanyInvite.create({
        companyId,
        email,
        invitedBy:req.user._id,
        status:"PENDING",
        expiredAt:expirationDate
    });
    
    const createdInvite=await CompanyInvite.findById(invite._id)
        .populate('companyId','name email description Logo')
        .populate('invitedBy','name email username');
    
    return res.status(201).json(
        new ApiResponse(201,createdInvite,"Founder invite sent successfully")
    );
});

const AcceptFounderInvite=asynchandler(async(req,res)=>{
    const {inviteId}=req.params;
    
    // Validate inviteId
    if(!isValidObjectId(inviteId)){
        throw new ApiError(400,"Invalid invite ID");
    }
    
    // Find the invite
    const invite=await CompanyInvite.findById(inviteId)
        .populate('companyId')
        .populate('invitedBy','name email');
    
    if(!invite){
        throw new ApiError(404,"Invite not found");
    }
    
    // Check if invite is for the current user
    if(invite.email!==req.user.email){
        throw new ApiError(403,"This invite is not for you");
    }
    
    // Check if invite is still pending
    if(invite.status!=="PENDING"){
        throw new ApiError(400,`Invite has already been ${invite.status.toLowerCase()}`);
    }
    
    // Check if invite has expired
    if(new Date()>new Date(invite.expiredAt)){
        // Update invite status to expired
        await CompanyInvite.findByIdAndUpdate(inviteId,{status:"REJECTED"});
        throw new ApiError(400,"This invite has expired");
    }
    
    // Add user as founder to the company
    const company=await Company.findByIdAndUpdate(
        invite.companyId._id,
        {
            $push:{
                founders:{
                    userId:req.user._id
                }
            }
        },
        {new:true}
    ).populate('founders.userId','name email username profilePicture');
    
    // Update user role to COMPANY
    await User.findByIdAndUpdate(req.user._id, { role: "COMPANY" });

    // Update invite status to accepted
    await CompanyInvite.findByIdAndUpdate(inviteId,{status:"ACCEPTED"});
    
    return res.status(200).json(
        new ApiResponse(200,company,"Founder invite accepted successfully. You are now a founder!")
    );
});

const RejectFounderInvite=asynchandler(async(req,res)=>{
    const {inviteId}=req.params;
    
    // Validate inviteId
    if(!isValidObjectId(inviteId)){
        throw new ApiError(400,"Invalid invite ID");
    }
    
    // Find the invite
    const invite=await CompanyInvite.findById(inviteId);
    
    if(!invite){
        throw new ApiError(404,"Invite not found");
    }
    
    // Check if invite is for the current user
    if(invite.email!==req.user.email){
        throw new ApiError(403,"This invite is not for you");
    }
    
    // Check if invite is still pending
    if(invite.status!=="PENDING"){
        throw new ApiError(400,`Invite has already been ${invite.status.toLowerCase()}`);
    }
    
    // Update invite status to rejected
    const rejectedInvite=await CompanyInvite.findByIdAndUpdate(
        inviteId,
        {status:"REJECTED"},
        {new:true}
    ).populate('companyId','name email')
     .populate('invitedBy','name email');
    
    return res.status(200).json(
        new ApiResponse(200,rejectedInvite,"Founder invite rejected")
    );
});

const GetMyInvites=asynchandler(async(req,res)=>{
    const {status}=req.query;
    
    // Build match criteria
    const matchCriteria={
        email:req.user.email
    };
    
    // Filter by status if provided
    if(status){
        if(!["PENDING","ACCEPTED","REJECTED"].includes(status)){
            throw new ApiError(400,"Invalid status. Must be PENDING, ACCEPTED, or REJECTED");
        }
        matchCriteria.status=status;
    }
    
    // Find all invites for the current user
    const invites=await CompanyInvite.find(matchCriteria)
        .populate('companyId','name email description website Logo')
        .populate('invitedBy','name email username')
        .sort({createdAt:-1});
    
    // Filter out expired pending invites and mark them as rejected
    const now=new Date();
    const validInvites=await Promise.all(
        invites.map(async(invite)=>{
            if(invite.status==="PENDING" && now>new Date(invite.expiredAt)){
                // Mark as rejected
                await CompanyInvite.findByIdAndUpdate(invite._id,{status:"REJECTED"});
                invite.status="REJECTED";
            }
            return invite;
        })
    );
    
    return res.status(200).json(
        new ApiResponse(200,validInvites,"Your invites fetched successfully")
    );
});

const GetCompanyInvites=asynchandler(async(req,res)=>{
    const {companyId}=req.params;
    const {status}=req.query;
    
    // Validate companyId
    if(!isValidObjectId(companyId)){
        throw new ApiError(400,"Invalid company ID");
    }
    
    // Find the company and populate founders
    const company=await Company.findById(companyId).populate('founders.userId');
    
    if(!company){
        throw new ApiError(404,"Company not found");
    }
    
    // Authorization: Only founders or admin can view company invites
    const isFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    if(req.user.role!=="ADMIN" && !isFounder){
        throw new ApiError(403,"You are not authorized to view invites for this company");
    }
    
    // Build match criteria
    const matchCriteria={
        companyId:new mongoose.Types.ObjectId(companyId)
    };
    
    // Filter by status if provided
    if(status){
        if(!["PENDING","ACCEPTED","REJECTED"].includes(status)){
            throw new ApiError(400,"Invalid status. Must be PENDING, ACCEPTED, or REJECTED");
        }
        matchCriteria.status=status;
    }
    
    // Find all invites for the company
    const invites=await CompanyInvite.find(matchCriteria)
        .populate('invitedBy','name email username')
        .sort({createdAt:-1});
    
    return res.status(200).json(
        new ApiResponse(200,invites,"Company invites fetched successfully")
    );
});

const CancelFounderInvite=asynchandler(async(req,res)=>{
    const {inviteId}=req.params;
    
    // Validate inviteId
    if(!isValidObjectId(inviteId)){
        throw new ApiError(400,"Invalid invite ID");
    }
    
    // Find the invite
    const invite=await CompanyInvite.findById(inviteId).populate('companyId');
    
    if(!invite){
        throw new ApiError(404,"Invite not found");
    }
    
    // Find the company and check if user is a founder
    const company=await Company.findById(invite.companyId._id).populate('founders.userId');
    
    const isFounder=company.founders?.some(
        founder=>founder.userId?._id?.toString()===req.user._id.toString()
    );
    
    // Authorization: Only the person who sent the invite, other founders, or admin can cancel
    if(req.user.role!=="ADMIN" && !isFounder && invite.invitedBy.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to cancel this invite");
    }
    
    // Check if invite is still pending
    if(invite.status!=="PENDING"){
        throw new ApiError(400,`Cannot cancel invite that has been ${invite.status.toLowerCase()}`);
    }
    
    // Delete the invite
    await CompanyInvite.findByIdAndDelete(inviteId);
    
    return res.status(200).json(
        new ApiResponse(200,{},"Founder invite cancelled successfully")
    );
});

export {
    SendFounderInvite,
    AcceptFounderInvite,
    RejectFounderInvite,
    GetMyInvites,
    GetCompanyInvites,
    CancelFounderInvite
};
