import {Router} from 'express';
import {addRole, removeRole} from '../controllers/Admin';
import {body} from 'express-validator';

const router = Router();

router.post('/roles/add', [body('user').isInt(), body('role').isString()], addRole);
router.post('/roles/remove', [body('user').isInt(), body('role').isString()], removeRole);

export default router;
