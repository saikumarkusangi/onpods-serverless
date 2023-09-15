import { Router } from 'express';
import { userQuotes ,userInfo} from '../../../controllers/user/v1/userController.js';


const router = Router();

router.get('/quotes',userQuotes);
router.get('/info',userInfo)


export default router;
