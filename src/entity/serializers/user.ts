import * as _ from 'lodash';
import { IUser } from '../User';

function serialize(instance: any, fields: string[]) {
    if (Array.isArray(instance)) {
        const result: any = [];
        instance.forEach((el) => result.push(_.pick(el, fields)));
        return result;
    }
    return _.pick(instance, fields);
}

export function userRetrieveSerializer(user: IUser) {
    const fields = ['id', 'email', 'displayName', 'firstName', 'lastName', 'active', 'membership', 'receivePushNotifications', 'hideEmail', 'hideMe', 'maxDistanceKm', 'favourites'];
    return serialize(user, fields);
}

export function userListSerializer(user: IUser[]) {
    const fields = ['email', 'displayName', 'firstName', 'lastName', 'favourites', '_id'];
    return serialize(user, fields);
}
