import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {BAD_REQUEST, CREATED, NOT_FOUND, OK, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {
    membershipNotExist,
    roleAssigned,
    roleNotExist,
    roleRemoved,
    userAlreadyAssignedRole,
    userNotExist, userWithRoleNotFound
} from '../shared/constants';
import User from '../entity/User';

const ROLES = ['user', 'restaurant', 'admin'];

export async function addRole(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }

    try {
        const {user: userId, role} = req.body;
        const roleExists = ROLES.includes(role);

        if (!roleExists) {
            return res.status(NOT_FOUND).send({success: false, message: roleNotExist})
        }

        const user = await User.findOne({_id: userId});

        if (!user) {
            return res.status(NOT_FOUND).send({success: false, message: userNotExist})
        }

        const roleAlreadyAssigned = user!.membership!.some((membership: any) => {
            return membership.role === role
        });
        if (roleAlreadyAssigned) {
            return res.status(BAD_REQUEST).send({success: false, message: userAlreadyAssignedRole})
        }

        await User.findByIdAndUpdate(user._id, { '$push': { 'membership': { role } }});

        return res.status(CREATED).send({
            success: true,
            message: roleAssigned
        });
    } catch (error) {
        return next(error);
    }
}

export async function removeRole(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({errors: errors.array()});
    }

    try {
        const {user: userId, role} = req.body;
        const roleExists = ROLES.includes(role);

        if (!roleExists) {
            return res.status(NOT_FOUND).send({success: false, message: roleNotExist})
        }

        const user = await User.findOne({_id: userId});

        if (!user) {
            return res.status(NOT_FOUND).send({success: false, message: userNotExist})
        }

        const roleAlreadyAssigned = user!.membership!.some((membership: any) => {
            return membership.role === role
        });

        if (!roleAlreadyAssigned) {
            return res.status(BAD_REQUEST).send({success: false, message: userWithRoleNotFound})
        }

        const memberships = user.membership.filter((membership: any) => {
            return membership.role !== role;
        });

        await User.findByIdAndUpdate(user._id, { membership: memberships });

        return res.status(OK).send({
            success: true,
            message: roleRemoved,
        })
    } catch (error) {
        return next(error);
    }
}
