import {Router} from 'express';
import * as reportController from '../../../controllers/report/reportController.js';

const router = Router();

router.get('/',reportController.allReports);
router.delete('/delete/:id',reportController.deleteReports);
router.post('/',reportController.reportPost);

export default router;