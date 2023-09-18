import {Router} from 'express';
import statsController from '../../../controllers/admin/v1/statsController.js';
import { isAdmin } from '../../../middleware/auth.js';

const router = Router();


router.get('/',isAdmin,statsController);

export default router;