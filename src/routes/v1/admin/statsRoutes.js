import {Router} from 'express';
import statsController from '../../../controllers/admin/v1/statsController.js';
import { isAdmin } from '../../../middleware/auth.js';

const router = Router();


router.get('/',statsController.stats);
router.get('/mongodb',statsController.mongodbStats);

export default router;