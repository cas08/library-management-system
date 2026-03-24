import { Router } from 'express';
import { loansController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, loansController.getAll);
router.post('/', authenticate, loansController.create);
router.post('/:id/return', authenticate, loansController.returnBook);

export default router;
