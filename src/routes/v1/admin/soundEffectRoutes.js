import express from 'express';
import { addNewCategory, addNewEffect, deleteData, getAllData } from '../../../controllers/admin/v1/soundEffectController.js';


const router = express.Router();

router.post('/', addNewCategory);
router.put('/:id', addNewEffect);
router.delete('/:id', deleteData);
router.get('/', getAllData);


export default router;
