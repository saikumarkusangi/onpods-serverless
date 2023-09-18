import { Router } from 'express';
import * as userController from '../../../controllers/admin/v1/userController.js';
import { isAdmin } from '../../../middleware/auth.js';

const router = Router();

router.get('/', isAdmin, userController.getAllUser);
router.get('/:userId', isAdmin, userController.getUser);
router.delete('/:userId', isAdmin, userController.deleteUser);
router.put('/:userId', isAdmin, userController.updateUser);

export default router;
