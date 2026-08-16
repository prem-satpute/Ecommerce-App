import { Schema } from "mongoose";

export const userShcema = new Schema({
    firstName:{
        type:String,
        required:[true,"First name must be required "]
    },
    lastName:{
        type:String,
        required:[true,"Last name must be requierd !"]
    },
    profilePic:{
        type:String,
        default:""
    },
    profilePicPublicId:{
        type:String,
        default:""
    },
    email:{
        type:String,
        required:[true, "Email must be required !"]
    },
    password:{
        type:String,
        required:[true,"Password must be required !"]
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    token:{
        type:String,
        default:null,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    isLoggedIn:{
        type:Boolean,
        default:false,
    },
    otp:{
        type:String,
        default:null,
    },
    otpExpiry:{
        type:Date,
        default:null,
    },
    addresss:{
        type:String,

    },
    city:{
        type:String,
    },
    zipCode:{
        type:String,
    },
    phoneNo:{
        type:String,
    }
},{timestamps:true})