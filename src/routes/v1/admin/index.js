import { Router } from 'express';
import userRoutes from './userRoutes.js';
import quoteRoutes from './quotesRoutes.js';
import podcastBgRoutes from './podcastBgRoutes.js';
import statsRoutes from './statsRoutes.js';
import podcastRoutes from './podcastRoutes.js';
import soundEffectRoutes from "./soundEffectRoutes.js"

const router = Router();

router.use('/users', userRoutes);
router.use('/quote-category',quoteRoutes);
router.use('/background-audio',podcastBgRoutes);
router.use('/stats',statsRoutes);
router.use('/podcast-category',podcastRoutes);
router.use('/sound-effects',soundEffectRoutes)



export default router;
