import mongoose,{Schema} from "mongoose";

const companyInviteSchema=new Schema({
    companyId:{
        type:mongoose.Types.ObjectId,
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
        type:mongoose.Types.ObjectId,
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
