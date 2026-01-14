import dotenv from "dotenv";
dotenv.config({path:"./.env"});
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("Error in starting the application", err);
});