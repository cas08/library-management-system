import { Router } from 'express';
import { authController } from '../controllers';
import passport from 'passport';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/request-password-reset', asyncHandler(authController.requestPasswordReset));
router.post('/reset-password', asyncHandler(authController.resetPassword));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    asyncHandler(authController.googleCallback),
);

export default router;
