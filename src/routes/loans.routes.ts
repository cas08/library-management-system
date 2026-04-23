import { Router } from 'express';
import { loansController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(loansController.getAll));
router.post('/', authenticate, asyncHandler(loansController.create));
router.post('/:id/return', authenticate, asyncHandler(loansController.returnBook));

export default router;
