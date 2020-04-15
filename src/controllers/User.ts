import {NextFunction, Request, Response} from 'express';
import {BAD_REQUEST, NO_CONTENT, OK} from 'http-status-codes';
import {emailNotUnique, requestBodyInvalid} from '@shared/constants';
import {User} from '../entity/User';
import {userListSerializer, userRetrieveSerializer} from '../entity/serializers/user';

export function retrieveUser(req: Request, res: Response) {
    const user = req.user!;
    return res.status(OK).send(userRetrieveSerializer(user));
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        let user = req.user!;
        const updates = Object.keys(req.body);

        const allowedUpdates = ['email', 'displayName', 'firstName', 'lastName'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(BAD_REQUEST).send({success: false, message: requestBodyInvalid});
        }

        const emailExists = await User.findOne({email: req.body.email.toLowerCase()});
        if (emailExists && emailExists.id !== user.id) {
            return res.status(BAD_REQUEST).send({success: false, message: emailNotUnique});
        }

        await User.update({id: user.id}, req.body);
        user = await User.findOne({id: user.id});

        return res.status(OK).send(userRetrieveSerializer(user));
    } catch (error) {
        return next(error)
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await User.findOne({id: req.user!.id});
        await user!.remove();
        return res.status(NO_CONTENT).send();
    }catch (error) {
        return next(error)
    }
}

export async function listUsers(req: Request, res: Response) {
    const users = await User.find();
    return res.status(OK).send(userListSerializer(users));
}

export async function changePasswordUser(req: Request, res: Response, next: NextFunction) {
    try {
        return res.send();
    }catch (error) {
        return next(error);
    }
}
