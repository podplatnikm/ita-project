import * as _ from 'lodash';
import {User} from '../User';

function serialize(instance: any, fields: string[]) {
    if (Array.isArray(instance)) {
        const result: any = [];
        instance.forEach((el) => result.push(_.pick(el, fields)));
        return result;
    } else {
        return _.pick(instance, fields);
    }
}

export function userRetrieveSerializer(user: User | User[]) {
    const fields = ['id', 'email', 'displayName', 'firstName', 'lastName', 'active', 'memberships'];
    return serialize(user, fields);
}

export function userListSerializer(user: User | User[]) {
    const fields = ['email', 'userName', 'firstName', 'lastName'];
    return serialize(user, fields);
}
