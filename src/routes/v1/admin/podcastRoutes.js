import { Router } from 'express';
const router = Router();
import * as podcastController from '../../../controllers/admin/v1/podcastController.js';
import { authorization, isAdmin } from '../../../middleware/auth.js';
import { upload } from '../../../services/s3Service.js';

router.post('/', upload.single('file'), podcastController.addPodcastCategory);
router.get('/', podcastController.fetchPodcastCategories);
router.delete('/:id', podcastController.deletePodcastCategory);
router.put('/:categoryId', upload.single('file'), podcastController.updatePodcastCategory);

export default router;