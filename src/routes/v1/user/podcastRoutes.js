import { Router } from 'express';
import * as podcastRoutes from '../../../controllers/user/v1/podcastController.js'
const router = Router();

router.post('/addPodcast', podcastRoutes.newpodcast);
router.post('/addEpisode/:podcastId', podcastRoutes.newEpisode);
router.delete('/podcasts/:podcastId', podcastRoutes.deletePodcast);
router.delete('/deleteEpisode/:podcastId/:episodeId', podcastRoutes.deleteEpisode);
router.put('/updatePodcast/:podcastId', podcastRoutes.updatePodcast);
router.put('/updateEpisode/:podcastId/:episodeId', podcastRoutes.updateEpisode);
router.get('/podcasts/:category',podcastRoutes.podcastByCategory)
router.get('/podcast/:podcastId',podcastRoutes.podcastById)
router.get('/search',podcastRoutes.search);

export default router;
