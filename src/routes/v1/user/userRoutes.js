import { Router } from 'express';
import { userQuotes, userInfo, userFollowers,updateMyList,getMyList, userFollowing, follow, unfollow ,userUpdate} from '../../../controllers/user/v1/userController.js';
import { authorization } from '../../../middleware/auth.js';
import { uploadProfilePic } from '../../../services/s3Service.js';

const router = Router();

router.use(authorization);

router.put('/update', uploadProfilePic.single('file'),authorization, userUpdate);
router.get('/quotes', authorization, userQuotes);
router.get('/info', authorization, userInfo);
router.get('/followers', authorization, userFollowers);
router.get('/following', authorization, userFollowing);
router.get('/follow', authorization, follow);
router.get('/unfollow', authorization, unfollow);
router.put('/mylist',authorization,updateMyList);
router.get('/mylist',authorization,getMyList);

export default router;
