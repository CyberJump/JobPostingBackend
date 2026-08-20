import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const jobSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    requirements:[{type:String,required:true}],
    location:{type:String,required:true},
    salary:{type:String,required:true},
    jobType:{
        type:String,
        enum:["FULLTIME","INTERNSHIP"],
        required:true,
    },
    status:{
        type:String,
        enum:["ACTIVE","INACTIVE"],
        default:"ACTIVE",
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    applicationDeadline:{
        type:Date
    }  
},{timestamps:true});

jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ status: 1, jobType: 1 });
jobSchema.index({ applicationDeadline: 1 });

jobSchema.plugin(mongooseAggregatePaginate);
export const Job=mongoose.model("Job",jobSchema);

