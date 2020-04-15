import {Router} from 'express';
import {deleteUser, listUsers, retrieveUser, updateUser, changePasswordUser} from '../controllers/User';

const router = Router();

router.get('/', listUsers);
router.get('/me', retrieveUser);
router.put('/me', updateUser);
router.delete('/me', deleteUser);

router.post('/me/change-password', changePasswordUser);

export default router;
