import {Router} from 'express';
import {addRole, removeRole} from '../controllers/Admin';
import {body} from 'express-validator';

const router = Router();

router.post('/roles/add', [body('user').isString(), body('role').isString()], addRole);
router.post('/roles/remove', [body('user').isString(), body('role').isString()], removeRole);

export default router;
