import { Router } from 'express';
import userRoutes from './userRoutes.js';
import quoteRoutes from './quotesRoutes.js';
import podcastBgRoutes from './podcastBgRoutes.js';
import statsRoutes from './statsRoutes.js';
import podcastRoutes from './podcastRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/quote-category',quoteRoutes);
router.use('/background-audio',podcastBgRoutes);
router.use('/stats',statsRoutes);
router.use('/podcast-category',podcastRoutes);



export default router;
