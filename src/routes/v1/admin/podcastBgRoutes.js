import { Router } from 'express';
const router = Router();
import * as podcastController from '../../../controllers/admin/v1/podcastController.js';
import { authorization, isAdmin } from '../../../middleware/auth.js';

router.post('/', authorization, podcastController.create);
router.get('/', authorization, podcastController.getAll);
router.post('/category/:categoryId', authorization, podcastController.addDataToCategory);
router.get('/category/:categoryId', authorization, podcastController.getAudioById);
router.delete('/:categoryId',podcastController.deleteById)



export default router;