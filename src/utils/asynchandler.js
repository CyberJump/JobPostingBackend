const asynchandler=(requesthandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((error)=>{
            let statusCode = error.code || error.statusCode || 500;
            // Ensure statusCode is a valid HTTP status code (100-999)
            if(statusCode < 100 || statusCode >= 1000){
                statusCode = 500;
            }
            res.status(statusCode).json({
                success:false,
                message:error.message || "Internal Server Error",
            });
        });

    }   
}


export {asynchandler};


// const asynchandler=(fn)=>async (req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message || "Internal Server Error",
//         });
//     }
// };