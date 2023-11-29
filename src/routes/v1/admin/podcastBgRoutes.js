import { Router } from 'express';
const router = Router();
import * as podcastController from '../../../controllers/admin/v1/podcastController.js';
import { authorization, isAdmin } from '../../../middleware/auth.js';

router.post('/', isAdmin, podcastController.create);
router.get('/', authorization, podcastController.getAll);
router.get('/:categoryId', authorization, podcastController.getById);
router.delete('/:categoryId', isAdmin, podcastController.deleteById);
router.put('/:categoryId', isAdmin, podcastController.addDataToCategory);
router.delete('/:categoryId/delete-audio/:audioId', isAdmin, podcastController.deleteAudioById);
router.put('/update/:categoryId', authorization, podcastController.updateCategoryById);
router.get('/audio/:audioId', authorization, podcastController.getAudioById);
router.post('/category/add',podcastController.addPodcastCategory);
router.get('/categories',podcastController.fetchPodcastCategories);
router.delete('/category/:id',podcastController.deletePodcastCategory);
router.put('/category/:id',podcastController.updatePodcastCategory);


export default router;