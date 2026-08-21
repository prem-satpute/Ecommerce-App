import * as userController from "../controllers/user.controller.js";
import express from "express";
import { body } from "express-validator";
import { isAuthenticated } from "../utils/Middleware/isAuthenticated.js";
import { isAdmin } from "../utils/Middleware/isAdmin.middleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName")
      .isLength({ min: 3 })
      .withMessage("First name must be at last 3 charecter"),
    
      body("lastName")
        .isLength({min:3})
        .withMessage("lastname must be at least 3 charecter"),

      body("email")
        .isEmail("Invalid Email"),
      
      body("password")
        .isStrongPassword()
        .withMessage("Password must be strong !")
  ],
  userController.registerUser,
);

router.post("/verify-email/:token",userController.verifyEmail);

//Login Route ()=> http://localhost:8080/user/api/login
router.post("/login",
  [
    body('email').isEmail("Invalid Email !"),
    body('password').isLength({min:3 , max:15}).withMessage("Password must at least 3 character long !")
  ],  
userController.loginUser);
router.get("/logout",isAuthenticated,userController.logoutUser);
router.post("/forgot-password",userController.forgotPassord);
router.post("/verify-forgot-password/:email",userController.verifyForgotPasswordOtp);
router.post("/change-password/:email",
  [
    body('newPassword').isStrongPassword().isLength({min:4}).withMessage("password must be 4 charecter long"),
    body('confirmPassword').isStrongPassword().isLength({min:4}).withMessage("password must be 4 charecter long")
  ]
,userController.changePassword);
router.post("/resend-otp/:email",userController.resedOtp);
router.post("/get-all-users",isAuthenticated, isAdmin,userController.getAllUser)
router.post("/get-user/:userId", userController.getUserById)

export default router;
