import { Router } from 'express';
import * as quoteCategoryController from '../../../controllers/admin/v1/quoteController.js';
import { authorization, isAdmin } from '../../../middleware/auth.js';

const router = Router();


router.post('/', isAdmin, quoteCategoryController.addQuoteCategory);
router.get('/', authorization, quoteCategoryController.allQuotesCategories);
router.delete('/:categoryId', isAdmin, quoteCategoryController.deleteQuoteCategory);
router.put('/:categoryId', isAdmin, quoteCategoryController.updateQuoteCategory);


export default router;