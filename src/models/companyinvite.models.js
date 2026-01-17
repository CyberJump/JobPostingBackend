import mongoose from "mongoose";

const companyInviteSchema=new mongoose.Schema({
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["PENDING","ACCEPTED","REJECTED"],
        default:"PENDING",
    },
    invitedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    expiredAt:{
        type:Date,
        required:true,
        default:Date.now()+15*60*1000,
    }
},{timestamps:true});

export const CompanyInvite=mongoose.model("CompanyInvite",companyInviteSchema);
