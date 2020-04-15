import {Request, Response} from 'express';
import {BAD_REQUEST, NO_CONTENT, OK} from 'http-status-codes';
import {userListSerializer, userRetrieveSerializer} from '@entities/serializers/user';
import User, {IUser} from '@entities/User';
import {emailNotUnique, requestBodyInvalid} from '@shared/constants';

export function retrieveUser(req: Request, res: Response) {
    const user = req.user!;
    return res.status(OK).send(userRetrieveSerializer(user));
}

export async function updateUser(req: Request, res: Response) {
    let user: IUser = req.user!;
    const updates = Object.keys(req.body);

    const allowedUpdates = ['email', 'userName', 'firstName', 'lastName'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(BAD_REQUEST).send({success: false, message: requestBodyInvalid});
    }

    user = {...user, ...req.body};

    const emailExists = await User.where({email: user.email.toLowerCase()}).fetch({require: false});
    if (emailExists && emailExists.toJSON().id !== user.id) {
        return res.status(BAD_REQUEST).send({success: false, message: emailNotUnique});
    }

    user = await User.forge(user).save({}, {method: 'update'});

    return res.status(OK).send(userRetrieveSerializer(user.toJSON()));
}

export async function deleteUser(req: Request, res: Response) {
    await User.forge({id: req.user!.id}).destroy();
    return res.status(NO_CONTENT).send();
}

export async function listUsers(req: Request, res: Response) {
    const users = await User.fetchAll({require: false});
    return res.status(OK).send(userListSerializer(users.toJSON()));
}
