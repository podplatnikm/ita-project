import { IAttendee } from '../Attendee';
import serialize from './common';

export function attendeeRetrieveSerializer(attendee: IAttendee) {
    const fields = ['_id', 'user', 'meet', 'message', 'seen', 'state', 'createdAt'];
    return serialize(attendee, fields);
}

export function attendeeListSerializer(attendee: IAttendee[]) {
    const fields = ['_id', 'user', 'meet', 'message', 'seen', 'state', 'createdAt', 'updatedAt'];
    return serialize(attendee, fields);
}
