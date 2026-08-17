import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';
import config from '../../config/config.js';

export const isAuthenticated  = async (req,res,next)=>{

    try{
        const accessToken = req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

    if(!accessToken){
        return res.status(400).json({
            success:false,
            message:"User is not logged in , you must be logged in first"
        })
    };

    let decoded ;

    try{
        decoded = jwt.verify(accessToken, config.JWT_SECRET);

    }catch(err){
        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                success:false,
                message:"Uauthorized , must be logged in first !"
            })
        }
    }

    const user = await User.findById(decoded.id);

    if(!user){
        return res.status(401).json({
            success:false,
            message:"Access token invalid , Token Expired !"
        })
    };
    
    req.userId = user._id; // save userId in request !
    req.user = user; // save the user info in request !
    next()


    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Something Went Wrong in isAuthenticated Middelware !",
            errors:err.message
        })

    };

}