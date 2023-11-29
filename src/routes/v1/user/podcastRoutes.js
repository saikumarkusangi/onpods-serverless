import { Router } from 'express';
import * as podcastRoutes from '../../../controllers/user/v1/podcastController.js';
import { authorization } from '../../../middleware/auth.js';
import {upload} from '../../../services/s3Service.js';

const router = Router();

router.use(authorization);


router.post('/add',upload.single('file'), podcastRoutes.newpodcast);
router.post('/:podcastId/add-episode', podcastRoutes.newEpisode);
router.delete('/:podcastId/delete', podcastRoutes.deletePodcast);
router.delete('/:podcastId/episode/:episodeId/delete', podcastRoutes.deleteEpisode);
router.put('/:podcastId/update', podcastRoutes.updatePodcast);
router.put('/:podcastId/episode/:episodeId/update', podcastRoutes.updateEpisode);
router.get('/category/:category', podcastRoutes.podcastByCategory)
router.get('/id/:podcastId', podcastRoutes.podcastById)
router.get('/search', podcastRoutes.search);

export default router;
