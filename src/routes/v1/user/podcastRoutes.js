import { Router } from 'express';
import * as podcastRoutes from '../../../controllers/user/v1/podcastController.js';
import { authorization } from '../../../middleware/auth.js';
import { upload, podcastmulter } from '../../../services/s3Service.js';

const router = Router();

router.use(authorization);


router.post('/add', podcastmulter.single('file'), podcastRoutes.newpodcast);
router.post('/:podcastId/add-episode', podcastmulter.fields([
    { name: 'audioUrl', maxCount: 1 },
    { name: 'posterUrl', maxCount: 1 }
]), podcastRoutes.newEpisode);
router.delete('/delete/:podcastId', podcastRoutes.deletePodcast);
router.delete('/:podcastId/episode/:episodeId', podcastRoutes.deleteEpisode);
router.put('/:podcastId/update', podcastmulter.single('posterUrl'), podcastRoutes.updatePodcast);
router.put('/:podcastId/episode/:episodeId', podcastmulter.single('posterUrl'), podcastRoutes.updateEpisode);
router.get('/category/:category', podcastRoutes.podcastByCategory);
router.get('/id/:podcastId', podcastRoutes.podcastById);
router.get('/user/:userId', podcastRoutes.podcastsByUserId)
router.get('/search', podcastRoutes.search);
router.get('/follow/:podcastId', podcastRoutes.followPodcast);
router.put('/:podcastId/rate', podcastRoutes.ratePodcast);
router.get('/:podcastId/episodes/:episodeId/listen', podcastRoutes.listenEpisode);
router.get('/trending', podcastRoutes.trendingPodcasts);
router.get('/top', podcastRoutes.topPodcasts);
export default router;