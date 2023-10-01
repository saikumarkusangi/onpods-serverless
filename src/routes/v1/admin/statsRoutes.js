import {Router} from 'express';
import statsController from '../../../controllers/admin/v1/statsController.js';
import { isAdmin } from '../../../middleware/auth.js';

const router = Router();


router.get('/',isAdmin,statsController.stats);
router.get('/mongodb',isAdmin,statsController.mongodbStats);

export default router;