import {Router} from 'express';
import {deleteUser, listUsers, retrieveUser, updateUser} from '../controllers/User';

const router = Router();

router.get('/', listUsers);
router.get('/me', retrieveUser);
router.put('/me', updateUser);
router.delete('/me', deleteUser);

export default router;
