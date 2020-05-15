import { NextFunction, Request, Response } from 'express';
import {
    BAD_REQUEST, NO_CONTENT, OK,
} from 'http-status-codes';
import Filter from 'bad-words';
import bcrypt from 'bcryptjs';
import {
    emailNotUnique,
    newPasswordMismatch,
    oldPasswordIncorrect, passwordChanged,
    profoundWord,
    requestBodyInvalid,
    samePassword,
} from '../shared/constants';
import User from '../entity/User';
import { userListSerializer, userRetrieveSerializer } from '../entity/serializers/user';

export function retrieveUser(req: Request, res: Response) {
    const { user } = req as any;
    return res.status(OK).send(userRetrieveSerializer(user));
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const updates = Object.keys(req.body);

        const allowedUpdates = ['email', 'displayName', 'firstName', 'lastName',
            'receivePushNotifications', 'hideEmail', 'hideMe', 'maxDistanceKm'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(BAD_REQUEST).send({ success: false, message: requestBodyInvalid });
        }

        updates.forEach((update) => { user[update] = req.body[update]; });

        const emailExists = await User.findOne({ email: user.email.toLowerCase() });
        if (emailExists && emailExists.id !== user.id) {
            return res.status(BAD_REQUEST).send({ success: false, message: emailNotUnique });
        }

        await user.save();

        return res.status(OK).send(userRetrieveSerializer(user));
    } catch (error) {
        return next(error);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        await User.findByIdAndRemove((req as any).user._id);
        return res.status(NO_CONTENT).send();
    } catch (error) {
        return next(error);
    }
}

export async function listUsers(req: Request, res: Response) {
    const users = await User.find();
    return res.status(OK).send(userListSerializer(users));
}

export async function changePasswordUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) {
            return res.status(BAD_REQUEST).send({
                success: false,
                message: newPasswordMismatch,
            });
        }

        if (oldPassword === newPassword && oldPassword === confirmNewPassword) {
            return res.status(BAD_REQUEST).send({
                success: false,
                message: samePassword,
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, (req as any).user.password);
        if (!isMatch) {
            return res.status(BAD_REQUEST).send({
                success: false,
                message: oldPasswordIncorrect,
            });
        }

        const { user } = (req as any);
        user.password = newPassword;
        await user.save();

        return res.status(OK).send({
            success: true,
            message: passwordChanged,
        });
    } catch (error) {
        return next(error);
    }
}

export async function addFavourite(req: Request, res: Response, next: NextFunction) {
    try {
        const { item } = req.body;
        const filter = new Filter();
        if (filter.isProfane(item)) {
            return res.status(BAD_REQUEST).send({ success: false, message: profoundWord });
        }
        const user = await User.findByIdAndUpdate(
            (req as any).user._id,
            { $addToSet: { favourites: item } },
            { new: true },
        );

        return res.status(OK).send(userRetrieveSerializer(user!));
    } catch (error) {
        return next(error);
    }
}

export async function removeFavourite(req: Request, res: Response, next: NextFunction) {
    try {
        const { item } = req.body;
        const user = await User.findByIdAndUpdate(
            (req as any).user._id,
            { $pull: { favourites: item } },
            { new: true },
        );

        return res.status(OK).send(userRetrieveSerializer(user!));
    } catch (error) {
        return next(error);
    }
}
