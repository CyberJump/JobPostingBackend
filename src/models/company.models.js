import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const companySchema=new Schema({
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
        default:"ACTIVE",
    },
    founders:[{
        userId:{
            type:mongoose.types.ObjectId,
            ref:"User",
            required:true,
        },
}],
    approvedBy:{
        type:mongoose.types.ObjectId,
        ref:"User",
    }
},{timestamps:true});

companySchema.plugin(mongooseAggregatePaginate);

export const Company=mongoose.model("Company",companySchema);
