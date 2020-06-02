import { Router } from 'express';
import { listMyAttendees } from '../controllers/Meet';

const router = Router();

router.get('/', listMyAttendees);

export default router;
