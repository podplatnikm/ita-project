import { NextFunction, Request, Response } from 'express';
import {
    BAD_REQUEST, CREATED, NOT_FOUND, OK,
} from 'http-status-codes';
import {
    roleAssigned,
    roleNotExist,
    roleRemoved,
    userAlreadyAssignedRole,
    userNotExist, userWithRoleNotFound,
} from '../shared/constants';
import User from '../entity/User';

const ROLES = ['user', 'restaurant', 'admin'];

export async function checkRole(req: Request, res: Response, next: NextFunction) {
    try {
        const { user: userId, role } = req.body;
        const roleExists = ROLES.includes(role);

        if (!roleExists) {
            return res.status(NOT_FOUND).send({ success: false, message: roleNotExist });
        }

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(NOT_FOUND).send({ success: false, message: userNotExist });
        }
        (req as any).userObject = user;
        return next();
    } catch (error) {
        return next(error);
    }
}

export async function addRole(req: Request, res: Response, next: NextFunction) {
    try {
        const { role } = req.body;
        const { userObject } = (req as any);

        const roleAlreadyAssigned = userObject!
            .membership!
            .some((membership: any) => membership.role === role);
        console.log('roleAlreadyAssigned', roleAlreadyAssigned);
        if (roleAlreadyAssigned) {
            return res.status(BAD_REQUEST).send(
                { success: false, message: userAlreadyAssignedRole },
            );
        }

        await User.findByIdAndUpdate(userObject._id, { $push: { membership: { role } } });

        return res.status(CREATED).send({
            success: true,
            message: roleAssigned,
        });
    } catch (error) {
        return next(error);
    }
}

export async function removeRole(req: Request, res: Response, next: NextFunction) {
    try {
        const { role } = req.body;
        const { userObject } = (req as any);

        const roleAlreadyAssigned = userObject!.membership!.some(
            (membership: any) => membership.role === role,
        );

        if (!roleAlreadyAssigned) {
            return res.status(BAD_REQUEST).send({ success: false, message: userWithRoleNotFound });
        }

        const memberships = userObject.membership.filter(
            (membership: any) => membership.role !== role,
        );

        await User.findByIdAndUpdate(userObject._id, { membership: memberships });

        return res.status(OK).send({
            success: true,
            message: roleRemoved,
        });
    } catch (error) {
        return next(error);
    }
}
