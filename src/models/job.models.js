import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const jobSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    company:{
        type:mongoose.Types.ObjectId,
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
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    applicationDeadline:{
        type:Date
    }  
},{timestamps:true})

jobSchema.plugin(mongooseAggregatePaginate);
export const Job=mongoose.model("Job",jobSchema);

