import {Router} from 'express';
import * as reportController from '../../../controllers/report/reportController.js';
import {isAdmin,authorization} from '../../../middleware/auth.js';

const router = Router();

router.get('/',isAdmin,reportController.allReports);
router.delete('/:id',isAdmin,reportController.deleteReports);
router.post('/',authorization,reportController.reportPost);

export default router;