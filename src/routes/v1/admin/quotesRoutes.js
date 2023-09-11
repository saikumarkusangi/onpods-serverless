import {Router} from 'express';

const router = Router();

import * as quoteRoutes from '../../../controllers/admin/v1/quoteController.js';

router.post('/api/add',quoteRoutes.addQuoteCategory);
router.get('/api/categories',quoteRoutes.allQuotesCategories);
router.delete('/api/category/delete/:id',quoteRoutes.deleteQuoteCategory);
router.put('/api/category/update/:id',quoteRoutes.updateQuoteCategory);


export default router;