import { Router } from 'express';
import { userQuotes } from '../../../controllers/user/v1/userController.js';


const router = Router();

router.get('/quotes',userQuotes);


export default router;
