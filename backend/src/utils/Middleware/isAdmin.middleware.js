import User from "../../models/user.model.js"

export const isAdmin = async (req, res,next)=>{

    if(req.user && req.user.role == "admin"){
        return next();
    }

    return res.status(403).json({
        success:false,
        message:"Access Denied : Admin Only !"
    })
}