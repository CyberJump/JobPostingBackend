import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const studentSchema=new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    branch:{
        type:String,
        required:true,
    },
    college:{
        type:String,
        required:true,
    },
    year:{
        type:String,
        required:true,
    },
    verificationDocument:{
        type:String,
        required:true,
    },
    approvedBy:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },
    status:{
        type:String,
        enum:["ACTIVE","PENDING","BLOCKED"],
        default:"ACTIVE",
    }

},{timestamps:true})

studentSchema.plugin(mongooseAggregatePaginate);

export const Student=mongoose.model("Student",studentSchema);
