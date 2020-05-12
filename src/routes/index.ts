import { Router } from 'express';
import UserRouter from './Users';
import AuthRouter from './Auth';
import AdminRouter from './Admin';
import MeetRouter from './Meet';
import { checkJwt } from '../middleware/checkJwt';
import { adminAuth } from '../middleware/adminAuth';

// Init router
const router = Router();

router.use('/users', checkJwt, UserRouter);
router.use('/admin', checkJwt, adminAuth, AdminRouter);
router.use('/auth', AuthRouter);
router.use('/meets', checkJwt, MeetRouter);

export default router;
