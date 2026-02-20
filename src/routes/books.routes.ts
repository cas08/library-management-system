import { Router } from 'express';
import { booksController } from '../controllers';

const router = Router();

router.get('/', booksController.getAll);
router.get('/:id', booksController.getById);
router.post('/', booksController.create);
router.put('/:id', booksController.update);
router.delete('/:id', booksController.delete);

export default router;
