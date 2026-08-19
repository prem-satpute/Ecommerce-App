import { redisClient } from "../connections/redisConnection.js";
import User from "../models/user.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/verifyEmial-folder/verify_email.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/sesssion.model.js";
import { sendOtp } from "../utils/send-otp-folder/sendOtp.js";

export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All Filed Must be required !",
    });
  }

  const isAlreadyExists = await User.findOne({ email });

  if (isAlreadyExists) {
    return res.status(409).json({
      success: false,
      message: "Conflict Error , User is already exists !",
    });
  }

  const registerRateLimit = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(registerRateLimit)) {
    return res.status(429).json({
      success: false,
      message: "Too many requrests, please try after some seconds",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const registerUserKey = `verify-key:${verifyToken}`;
  const dataToStore = JSON.stringify({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  await redisClient.set(registerUserKey, dataToStore, { EX: 300 });
  await redisClient.set(registerRateLimit, "true", { EX: 30 });

  sendVerificationEmail(email, verifyToken);

  return res.status(200).json({
    success: true,
    message: `Verification mail is send at email ${email}`,
    token: verifyToken,
  });
};

export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token Not Found !",
    });
  }

  const verifyTokenKey = `verify-key:${token}`;

  const stringData = await redisClient.get(verifyTokenKey);

  if (!stringData) {
    return res.status(403).json({
      success: false,
      message: "Token Expired !",
    });
  }

  const actualData = JSON.parse(stringData);
  const isUserExistAlready = await User.findOne({ email: actualData.email });

  if (isUserExistAlready) {
    return res.status(409).json({
      success: false,
      message: "Conflict Error user is exist already !",
    });
  }

  const user = await User.create(actualData);
  user.isVerified = true;
  await user.save();

  return res.status(200).json({
    success: false,
    message: "User is register succesfully !",
    user: user,
  });
};

export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      Errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All filed Must be  Required !",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User Not Found !",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized !",
    });
  }

  if (user.isVerified == false) {
    return res.status(401).json({
      success: false,
      message: "User is not verified !",
    });
  }

  const loginRateLimit = `login-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(loginRateLimit)) {
    return res.status(429).json({
      success: false,
      message: "Too many requests , Please try after some seconds !",
    });
  }

  user.isLoggedIn = true;
  await user.save();

  const existingSession = await Session.findOne({ userId: user._id });

  if (existingSession) {
    await Session.deleteOne({ userId: user._id });
  }

  await Session.create({
    userId: user._id,
  });

  const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  await redisClient.set(loginRateLimit, "true", { EX: 30 });

  // 30 seconds :

  return res.status(200).json({
    success: true,
    message: "User is successfully login in App !",
    user: user,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

export const logoutUser = async (req, res, next) => {
  const userId = req.userId;

  if (!(await Session.findOne({ userId: userId }))) {
    return res.status(400).json({
      success: false,
      message: "User Is Logged Out Already , Can`t Loggout Again !",
    });
  }

  await Session.deleteMany({ userId: userId });
  const user = await User.findById(userId);
  await User.findByIdAndUpdate(userId, { isLoggedIn: false });

  return res.status(200).json({
    success: true,
    message: `${user.firstName} Loggout Successfully !`,
  });
};

export const forgotPassord = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email must be required to reset password !",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User Not Found !",
    });
  }

  // rate to handle multiple requests !
  const forgotPasswordRateLimitKey = `fogot-password-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(forgotPasswordRateLimitKey)) {
    return res.status(429).json({
      success: false,
      message: "Too many requests , Please try after some seconds",
    });
  }

  // checking in redis cache data is valid or not
  const forgotPasswordOtpKey = `forgot-password-otp-key:${email}`;

 
  if (
    user.otp &&
    user.otpExpiry &&
    user.otpExpiry > new Date() &&
    (await redisClient.get(forgotPasswordOtpKey))
  ) {
   
    return res.status(400).json({
      success: false,
      message:
        "Can`t generate New OTP , beacuse current OTP not expired till !",
    });
  }

  const otp = Math.floor(10000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  // store the data in mongoose databse :
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // set the data in redis cache
  await redisClient.set(forgotPasswordOtpKey, JSON.stringify(otp), { EX: 300 });
  await redisClient.set(forgotPasswordRateLimitKey, "true", { EX: 30 });

  sendOtp(email, otp);

  return res.status(200).json({
    success: true,
    message: `Successfully send the otp at email = ${email}`,
    otp: otp,
  });
};

export const verifyForgotPasswordOtp = async (req,res,next)=>{
  const {otp} = req.body;
  const {email} = req.params

  if(!otp){
    return res.status(400).json({
      success:false,
      message:"OTP must be required !"
    });
  };

  if(!email){
    return res.status(400).json({
      success:false,
      message:"Must be required !"
    });
  };

  const user = await User.findOne({email});

  if(!user){
     return res.status(404).json({
      success:false,
      message:"User Not Found !"
     });
  };

  

  const forgotPasswordOtpKey = `forgot-password-otp-key:${email}`;
  const StringOtp  = await redisClient.get(forgotPasswordOtpKey);

  if(!StringOtp){
    return res.status(400).json({
      success:false,
      message:"OTP is expired , generate new OTP Please !"
    })
  };


  const actualOtp = JSON.parse(StringOtp);

  if(user.otp !== otp && actualOtp !== otp){
    if(user.otpExpiry< new Date()){
      return res.status(400).json({
        success:false,
        message:"OTP is Expired , please generate new OTP to re-verify again !",
      })
    }

    return res.status(400).json({
      success:false,
      message:"OTP is not Matched "
    })
    
  };

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  await redisClient.del(forgotPasswordOtpKey);


  return res.status(200).json({
    success:true,
    message:"Forgot-password OTP is successfully Veririfed, OTP Match !"
  })

};

