import { Router } from 'express';
import * as quoteController from '../../../controllers/user/v1/quoteController.js';
import { authorization } from '../../../middleware/auth.js';
import {upload} from '../../../services/s3Service.js';

const router = Router();

router.use(authorization);

router.post('/upload', upload.single('file'),quoteController.uploadQuote);
router.get('/category/:category', quoteController.getQuotesByCategory);
router.put('/like/:id', quoteController.increaseLikes);
router.get('/search', quoteController.searchQuotes);
router.delete('/:id', quoteController.deleteQuote);
router.get('/id/:id', quoteController.getQuoteId);
router.get('/related/:id', quoteController.relatedQuotes);

export default router;
