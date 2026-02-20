import { Router } from 'express';
import { loansController } from '../controllers';

const router = Router();

router.get('/', loansController.getAll);
router.post('/', loansController.create);
router.post('/:id/return', loansController.returnBook);

export default router;
