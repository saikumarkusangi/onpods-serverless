import { Router } from 'express';
import * as podcastRoutes from '../../../controllers/user/v1/podcastController.js'
const router = Router();

router.post('/addPodcast', podcastRoutes.newpodcast);
router.post('/addEpisode/:podcastId', podcastRoutes.newEpisode);
router.delete('/deletePodcast/:podcastId', podcastRoutes.deletePodcast);
router.delete('/deleteEpisode/:podcastId/:episodeId', podcastRoutes.deleteEpisode);
router.put('/updatePodcast/:podcastId', podcastRoutes.updatePodcast);
router.put('/updateEpisode/:podcastId/:episodeId', podcastRoutes.updateEpisode);

export default router;
