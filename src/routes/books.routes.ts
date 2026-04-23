import { Router } from 'express';
import { booksController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

router.get('/', asyncHandler(booksController.getAll));
router.get('/:id', asyncHandler(booksController.getById));
router.post('/', authenticate, authorize('ADMIN'), asyncHandler(booksController.create));
router.put('/:id', authenticate, authorize('ADMIN'), asyncHandler(booksController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(booksController.delete));

export default router;
