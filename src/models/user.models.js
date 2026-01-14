import mongoose,{schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        required:true,
    },

    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    role:{
        type:String,
        enum:["STUDENT","COMPANY","ADMIN"],
        default:"STUDENT",
    },
    profilePicture:{
        type:String,
    },
    status:{
        type:String,
        enum:["ACTIVE","PENDING","BLOCKED"],
        default:"ACTIVE",
    },
    refreshToken:{
        type:String,
    },
    
},{timestamps:true});

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    this.password=await bcrypt.hash(this.password,10);
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

userSchema.methods.generateAccessToken=async function(){
    return jwt.sign({
        _id:this.id,
        role:this.role,
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}


export const User=mongoose.model("User",userSchema);

