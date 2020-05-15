import { Router } from 'express';
import { body } from 'express-validator';
import {
    deleteUser,
    listUsers,
    retrieveUser,
    updateUser,
    changePasswordUser,
    addFavourite,
    removeFavourite,
} from '../controllers/User';
import { checkValErr } from '../middleware/checkValErr';

const router = Router();

router.get('/', listUsers);
router.get('/me', retrieveUser);
router.put('/me', updateUser);
router.delete('/me', deleteUser);

router.post('/me/favourites/add',
    [body('item').isString().isLength({ min: 3 })],
    checkValErr,
    addFavourite);
router.post('/me/favourites/remove',
    [body('item').isString().isLength({ min: 3 })],
    checkValErr,
    removeFavourite);

router.post('/me/password/change',
    [body('oldPassword').isString().isLength({ min: 6, max: 20 }),
        body('newPassword').isString().isLength({ min: 6, max: 20 }),
        body('confirmNewPassword').isString().isLength({ min: 6, max: 20 })],
    checkValErr,
    changePasswordUser);

export default router;
