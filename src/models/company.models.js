import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const companySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true
    },
    website:String,
    Logo:String,
    status:{
        type:String,
        enum:["ACTIVE","PENDING","BLOCKED"],
        default:"PENDING",
    },
    founders:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
}],
    approvedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true});

companySchema.plugin(mongooseAggregatePaginate);

export const Company=mongoose.model("Company",companySchema);
