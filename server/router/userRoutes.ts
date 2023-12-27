import express, { Router } from 'express';
const userRouter: Router = express.Router();
const { SignUserUp, SignUserIn, UserLogout , OTPSend, OTPVerify } = require('../controllers/userController');
const {isAuthenticated } = require('../middleware/userMiddleware');

userRouter.post("/signup", SignUserUp);
userRouter.post("/signin", SignUserIn);
userRouter.post("/logout", isAuthenticated,UserLogout);
userRouter.post("/sendOtp",OTPSend);
userRouter.post("/verifyOTP",OTPVerify);
module.exports = userRouter;