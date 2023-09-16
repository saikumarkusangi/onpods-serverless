import { Router } from 'express';
import { userQuotes, userInfo } from '../../../controllers/user/v1/userController.js';
import { authorization } from '../../../middleware/auth.js';

const router = Router();

router.use(authorization);


router.get('/quotes', authorization, userQuotes);
router.get('/info', authorization, userInfo)


export default router;
