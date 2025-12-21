import express from 'express';
import { 
    register, 
    login, 
    logout, 
    sendVerifyOtp, 
    verifyEmail, 
    isAuthenticated, 
    sendResetOTP, 
    resetPassword 
} from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', sendVerifyOtp);
authRouter.post('/verify-account', verifyEmail);
authRouter.get('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOTP);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
