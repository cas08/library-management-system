import { Router } from 'express';
import authRouter from './auth.routes';
import booksRouter from './books.routes';
import usersRouter from './users.routes';
import loansRouter from './loans.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/books', booksRouter);
router.use('/users', usersRouter);
router.use('/loans', loansRouter);

export default router;
