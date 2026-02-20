import { Router } from 'express';
import { usersController } from '../controllers';

const router = Router();

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);

export default router;
