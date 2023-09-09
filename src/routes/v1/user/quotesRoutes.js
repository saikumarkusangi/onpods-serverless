import { Router } from 'express';
import { deleteQuote, getQuotesByCategory, getQuoteId, increaseLikes, searchQuotes, uploadQuote, relatedQuotes } from '../../../controllers/user/v1/quoteController.js';

const router = Router();

router.post('/upload',uploadQuote);
router.get('/',getQuotesByCategory);
router.get('/like/:id',increaseLikes);
router.get('/search',searchQuotes);
router.delete('/delete',deleteQuote);
router.get('/:id',getQuoteId);
router.get('/related/:id',relatedQuotes);

export default router;
