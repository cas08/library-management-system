import { Router } from 'express';
import { booksController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/', booksController.getAll);
router.get('/:id', booksController.getById);
router.post('/', authenticate, authorize('ADMIN'), booksController.create);
router.put('/:id', authenticate, authorize('ADMIN'), booksController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), booksController.delete);

export default router;
