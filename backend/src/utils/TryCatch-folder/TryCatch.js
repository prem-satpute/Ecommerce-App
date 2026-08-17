export const TryCatch = (handler)=>{
    return async function (req,res,next){
        try{
            await handler(req,res,next);
        }catch(err){
            return res.status(500).json({
                success:false,
                message:err.message,
            })
        };

    }
}