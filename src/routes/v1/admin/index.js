import { Router } from 'express';
import userRoutes from './userRoutes.js';
import quoteRoutes from './quotesRoutes.js';
import podcastBgRoutes from './podcastRoutes.js';

const router = Router();

router.use('/admin', userRoutes);
router.use('/quote',quoteRoutes);
router.use('/background-audio',podcastBgRoutes);


export default router;
