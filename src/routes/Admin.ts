import { Router } from 'express';
import { body } from 'express-validator';
import { addRole, checkRole, removeRole } from '../controllers/Admin';
import { checkValErr } from '../middleware/checkValErr';

const router = Router();

router.post('/roles/add',
    [body('user').isString(), body('role').isString()],
    checkValErr,
    checkRole,
    addRole);
router.post('/roles/remove',
    [body('user').isString(), body('role').isString()],
    checkValErr,
    checkRole,
    removeRole);

export default router;
