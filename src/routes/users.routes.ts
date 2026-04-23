import { Router } from 'express';
import { usersController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { uploadAvatar } from '../middleware/upload.middleware';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

router.get('/me', authenticate, asyncHandler(usersController.getMe));
router.post('/me/avatar', authenticate, uploadAvatar, asyncHandler(usersController.uploadAvatar));
router.delete('/me/avatar', authenticate, asyncHandler(usersController.deleteAvatar));
router.get('/', authenticate, authorize('ADMIN'), asyncHandler(usersController.getAll));
router.get('/:id', authenticate, authorize('ADMIN'), asyncHandler(usersController.getById));

export default router;
