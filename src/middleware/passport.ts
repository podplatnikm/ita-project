// @ts-ignore
import * as GoogleTokenStrategy from 'passport-google-token';
import passport from 'passport';
import User from '../entity/User';
import { emailNotUnique } from '../shared/constants';
import ValidationError from '../shared/error/ValidationError';

passport.use('googleToken', new GoogleTokenStrategy.Strategy({
    clientID: '769533967657-673m9eh3gr2lq20ghh66hhs4tbl9q953.apps.googleusercontent.com',
    clientSecret: 'dFkkkYusYuiSYJ4D83bJ2T41',
}, async (accessToken: any, refreshToken: any, profile: any, done: Function) => {
    try {
        const existingUser = await User.findOne({ email: profile._json.email });
        if (existingUser && existingUser.method === 'local') {
            const error = new ValidationError(emailNotUnique);
            return done(error, false, emailNotUnique);
        }

        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = new User({
            method: 'google',
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile._json.email,
            membership: [{
                role: 'user',
            }],
        });
        await newUser.save();

        return done(null, newUser);
    } catch (error) {
        return done(error, false, error.message);
    }
}));
