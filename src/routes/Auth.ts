// Init shared
import {Router} from 'express';
import {signupAuth, tokenAuth} from '../controllers/Auth';
import { body } from 'express-validator';

const router = Router();

router.post('/sign-up', [
    body('email').isEmail(),
    body('password').isString(),
    body('displayName').isString(),
    body('firstName').optional(),
    body('lastName').optional()], signupAuth);
router.post('/token', [body('email').isEmail(), body('password').isString()], tokenAuth);

export default router;
