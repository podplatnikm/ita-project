import * as _ from 'lodash';
import {IUser} from '@entities/User';

function serialize(instance: any, fields: string[]) {
    if (Array.isArray(instance)) {
        const result: any = [];
        instance.forEach((el) => result.push(_.pick(el, fields)));
        return result;
    } else {
        return _.pick(instance, fields);
    }
}

export function userRetrieveSerializer(user: IUser | IUser[]) {
    const fields = ['id', 'email', 'userName', 'firstName', 'lastName', 'active', 'memberships'];
    return serialize(user, fields);
}

export function userListSerializer(user: IUser | IUser[]) {
    const fields = ['email', 'userName', 'firstName', 'lastName'];
    return serialize(user, fields);
}
