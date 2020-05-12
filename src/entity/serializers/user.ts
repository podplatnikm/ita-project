import { IUser } from '../User';
import serialize from './common';

export function userRetrieveSerializer(user: IUser) {
    const fields = ['id', 'email', 'displayName', 'firstName', 'lastName', 'active', 'membership', 'receivePushNotifications', 'hideEmail', 'hideMe', 'maxDistanceKm', 'favourites'];
    return serialize(user, fields);
}

export function userListSerializer(user: IUser[]) {
    const fields = ['email', 'displayName', 'firstName', 'lastName', 'favourites', '_id'];
    return serialize(user, fields);
}
