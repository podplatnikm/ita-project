import { IMeet } from '../Meet';
import serialize from './common';


export function meetListSerializer(meet: IMeet[]) {
    const fields = ['_id', 'user', 'location', 'locationName', 'datetime', 'description', 'totalParticipants', 'createdAt'];
    return serialize(meet, fields);
}

export function meetRetrieveSerializer(meet: IMeet) {
    const fields = ['_id', 'user', 'location', 'locationName', 'datetime', 'description', 'totalParticipants', 'createdAt', 'events'];
    return serialize(meet, fields);
}
