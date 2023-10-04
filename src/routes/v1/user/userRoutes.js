import { Router } from 'express';
import { userQuotes, userInfo, userFollowers, userFollowing, follow,unfollow } from '../../../controllers/user/v1/userController.js';
import { authorization } from '../../../middleware/auth.js';

const router = Router();

router.use(authorization);


router.get('/quotes', authorization, userQuotes);
router.get('/info', authorization, userInfo);
router.get('/followers', authorization, userFollowers);
router.get('/following', authorization, userFollowing);
router.get('/follow', authorization, follow);
router.get('/unfollow', authorization, unfollow);

export default router;
