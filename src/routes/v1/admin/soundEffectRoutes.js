import express from 'express';
import { addData, deleteData, getAllData } from '../../../controllers/admin/v1/soundEffectController.js';


const router = express.Router();

router.post('/', addData);
router.delete('/:id', deleteData);
router.get('/', getAllData);


export default router;
