import {Router} from 'express';
const router = Router();
import * as podcastBgCategoriesController from '../../../controllers/admin/v1/podcastController.js';

router.post('/', podcastBgCategoriesController.create);
router.get('/', podcastBgCategoriesController.getAll);
router.get('/:categoryId', podcastBgCategoriesController.getById);
router.delete('/:categoryId',podcastBgCategoriesController.deleteById);
router.put('/:categoryId',podcastBgCategoriesController.addDataToCategory);
router.delete('/:categoryId/delete-audio/:audioId', podcastBgCategoriesController.deleteAudioById);
router.put('/update/:categoryId',podcastBgCategoriesController.updateCategoryById);
router.get('/audio/:audioId',podcastBgCategoriesController.getAudioById)

export default router;