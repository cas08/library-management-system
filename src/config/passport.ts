import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {env} from './env';
import {authService} from '../services';

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) {
                        return done(new Error('No email found in Google profile'));
                    }

                    const result = await authService.googleAuth({
                        googleId: profile.id,
                        email,
                        name: profile.displayName || email,
                    });

                    done(null, {
                        userId: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        token: result.token,
                    });
                } catch (err) {
                    done(err as Error);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
});
