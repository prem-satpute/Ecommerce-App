import { redisClient } from "../connections/redisConnection.js";
import User from "../models/user.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/verifyEmial-folder/verify_email.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/sesssion.model.js";

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

    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            Errors:errors.array()
        })
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
