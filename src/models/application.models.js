import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema=new Schema({
    job:{
        type:mongoose.Types.ObjectId,
        ref:"Job",
        required:true,
    },
    student:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    company:{
        type:mongoose.Types.ObjectId,
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
    reviewedBy:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },
    

},{timestamps:true});

applicationSchema.plugin(mongooseAggregatePaginate);

export const Application=mongoose.model("Application",applicationSchema);