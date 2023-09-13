import {Router} from 'express';

const router = Router();

import * as quoteRoutes from '../../../controllers/admin/v1/quoteController.js';

router.post('/api/category',quoteRoutes.addQuoteCategory);
router.get('/api/categories',quoteRoutes.allQuotesCategories);
router.delete('/api/category/:id',quoteRoutes.deleteQuoteCategory);
router.put('/api/category/:id',quoteRoutes.updateQuoteCategory);


export default router;