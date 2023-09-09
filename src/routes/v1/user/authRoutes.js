import { Router } from 'express';
import * as authController from '../../../controllers/user/v1/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh', authController.handleRefreshToken);
router.get('/logout', authController.logout);

export default router;
