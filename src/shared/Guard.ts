import PermissionDeniedError from './error/PermissionDeniedError';
import { notOwner } from './constants';

export default class Guard {
    static isOwner(objectUserId: string, requestUserId: string) {
        if (objectUserId !== requestUserId) {
            throw new PermissionDeniedError(notOwner);
        }
    }
}
