import { Router } from 'express';
import * as authController from '../../../controllers/user/v1/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/send-otp',authController.sendCreateAccountOtp);
router.post('/forgot-password',authController.sendForgotPasswordOtp)
router.post('/reset-password',authController.resetPassword);
router.delete('/delete',authController.deleteAccount);
export default router;
