import { Router } from 'express';
const router = Router();
import * as podcastBgCategoriesController from '../../../controllers/admin/v1/podcastController.js';
import { authorization, isAdmin } from '../../../middleware/auth.js';

router.post('/', isAdmin, podcastBgCategoriesController.create);
router.get('/', authorization, podcastBgCategoriesController.getAll);
router.get('/:categoryId', authorization, podcastBgCategoriesController.getById);
router.delete('/:categoryId', isAdmin, podcastBgCategoriesController.deleteById);
router.put('/:categoryId', isAdmin, podcastBgCategoriesController.addDataToCategory);
router.delete('/:categoryId/delete-audio/:audioId', isAdmin, podcastBgCategoriesController.deleteAudioById);
router.put('/update/:categoryId', authorization, podcastBgCategoriesController.updateCategoryById);
router.get('/audio/:audioId', authorization, podcastBgCategoriesController.getAudioById)

export default router;