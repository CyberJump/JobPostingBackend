import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema=new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true,
    },
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true,
    },
    status:{
        type:String,
        enum:["APPLIED","SHORTLISTED","OFFER","REJECTED"],
        default:"APPLIED",
    },
    resumeUrl:{
        type:String,
    },
    addtionalDocuments:[{
        type:String,
    }],
    offerLetterUrl:{
        type:String,
    },
    reviewedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
},{timestamps:true});

applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });

applicationSchema.plugin(mongooseAggregatePaginate);

export const Application=mongoose.model("Application",applicationSchema);