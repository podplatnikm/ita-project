import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { returnToken, signupAuth, tokenAuth } from '../controllers/Auth';
import { checkValErr } from '../middleware/checkValErr';

require('../middleware/passport');

const router = Router();

router.post('/sign-up',
    [body('email').isEmail(),
        body('password').isString(),
        body('displayName').isString(),
        body('firstName').optional(),
        body('lastName').optional()],
    checkValErr,
    signupAuth);
router.post('/token',
    [body('email').isEmail(),
        body('password').isString()],
    checkValErr,
    tokenAuth,
    returnToken);
router.post('/social/google/token',
    [body('access_token').isString()],
    checkValErr,
    passport.authenticate('googleToken', { session: false }),
    returnToken);

export default router;
