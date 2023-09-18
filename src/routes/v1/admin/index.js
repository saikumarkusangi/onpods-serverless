import { Router } from 'express';
import userRoutes from './userRoutes.js';
import quoteRoutes from './quotesRoutes.js';
import podcastBgRoutes from './podcastRoutes.js';
import statsRoutes from './statsRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/quote-category',quoteRoutes);
router.use('/background-audio',podcastBgRoutes);
router.use('/stats',statsRoutes);


export default router;
