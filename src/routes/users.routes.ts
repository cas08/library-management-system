import { Router } from 'express';
import { usersController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.get('/', authenticate, authorize('ADMIN'), usersController.getAll);
router.get('/:id', authenticate, authorize('ADMIN'), usersController.getById);

export default router;
