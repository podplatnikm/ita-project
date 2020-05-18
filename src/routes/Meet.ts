import { Router } from 'express';
import { body } from 'express-validator';
import {
    createMeet, deleteMeet, listMeets, retrieveMeet, createParticipation, listMeetAttendees, vetoMeetAttendees,
} from '../controllers/Meet';
import { checkValErr } from '../middleware/checkValErr';
import { locationSchema } from '../entity/schemas/Meet';
import { states } from '../entity/Attendee';

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
router.post('/:id/attendees',
    [body('message').isString().optional()],
    checkValErr,
    createParticipation);

router.get('/:id/attendees', listMeetAttendees);
router.put('/:meetId/attendees/:attendeeId',
    [body('state').isString().custom((value: string) => {
        try {
            return !!states.includes(value);
        } catch (e) {
            return false;
        }
    })],
    checkValErr,
    vetoMeetAttendees);

export default router;
