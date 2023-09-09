import {Router} from 'express';

const router = Router();

import * as quoteRoutes from '../../../controllers/admin/v1/quoteController.js';

router.post('/add',quoteRoutes.addQuoteCategory);
router.get('/categories',quoteRoutes.allQuotesCategories);
router.delete('/category/delete/:id',quoteRoutes.deleteQuoteCategory);
router.put('/category/update/:id',quoteRoutes.updateQuoteCategory);


export default router;