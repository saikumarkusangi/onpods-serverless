import { Router } from 'express';
import authRoutes from './authRoutes.js';
import quoteRoutes from './quotesRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/quote',quoteRoutes);


export default router;
