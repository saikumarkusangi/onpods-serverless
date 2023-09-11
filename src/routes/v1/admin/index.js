import { Router } from 'express';
import userRoutes from './userRoutes.js';
import quoteRoutes from './quotesRoutes.js';

const router = Router();

router.use('/admin', userRoutes);
router.use('api/quote',quoteRoutes);


export default router;
