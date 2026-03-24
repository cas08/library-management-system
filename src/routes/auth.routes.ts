import { Router } from 'express';
import { authController } from '../controllers';
import passport from 'passport';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    authController.googleCallback
);

export default router;
