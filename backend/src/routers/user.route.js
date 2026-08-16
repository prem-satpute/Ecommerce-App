import * as userController from "../controllers/user.controller.js";
import express from "express";
import { body } from "express-validator";

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

export default router;
