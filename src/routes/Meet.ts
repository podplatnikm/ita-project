import { Router } from 'express';
import { body } from 'express-validator';
import {
    createMeet, deleteMeet, listMeets, retrieveMeet,
} from '../controllers/Meet';
import { checkValErr } from '../middleware/checkValErr';
import { locationSchema } from '../entity/schemas/Meet';

const router = Router();

router.get('/', listMeets);
router.post('/',
    [body('locationName').isString().isLength({ min: 3, max: 50 }),
        body('description').isString().optional(),
        body('datetime').isISO8601().toDate(),
        body('location').custom((value: any) => {
            try {
                locationSchema.validateSync(value);
                return true;
            } catch (e) {
                return false;
            }
        })],
    checkValErr,
    createMeet);
router.get('/:id', retrieveMeet);
router.delete('/:id', deleteMeet);

export default router;
