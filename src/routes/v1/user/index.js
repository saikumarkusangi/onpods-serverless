import { Router } from 'express';
import authRoutes from './authRoutes.js';
import quoteRoutes from './quotesRoutes.js';
import podcastRoutes from './podcastRoutes.js';
import userRoutes from './userRoutes.js'

const router = Router();

router.use('/auth', authRoutes);
router.use('/quote',quoteRoutes);
router.use('/podcast',podcastRoutes);
router.use('/user',userRoutes);


export default router;
