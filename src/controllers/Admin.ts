import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {BAD_REQUEST, CREATED, NOT_FOUND, OK, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {
    membershipNotExist,
    roleAssigned,
    roleNotExist,
    roleRemoved,
    userAlreadyAssignedRole,
    userNotExist
} from '@shared/constants';
import {User} from '../entity/User';
import {Membership} from '../entity/Membership';
import {Account} from '../entity/Account';

export async function addRole(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }

    try {
        const {user: userId, role} = req.body;
        const account = await Account.findOne({role});

        if (!account) {
            return res.status(NOT_FOUND).send({success: false, message: roleNotExist})
        }

        const user = await User.findOne({id: userId}, { relations: ['memberships']});
        return res.send(user);

        if (!user) {
            return res.status(NOT_FOUND).send({success: false, message: userNotExist})
        }

        const roleAlreadyAssigned = user!.memberships!.some((membership: Membership) => {
            return membership.accountId === account!.id
        });
        if (roleAlreadyAssigned) {
            return res.status(BAD_REQUEST).send({success: false, message: userAlreadyAssignedRole})
        }

        const newMembership = new Membership();
        newMembership.account = account!;
        newMembership.user = user!;
        await newMembership.save();

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
        const account = await Account.findOne({role});

        if (!account) {
            return res.status(NOT_FOUND).send({success: false, message: roleNotExist})
        }

        const membership = await Membership.findOne({userId, accountId: account.id});
        if(!membership){
            return res.status(NOT_FOUND).send({success: false, message: membershipNotExist})
        }

        await membership.remove();
        return res.status(OK).send({
            success: true,
            message: roleRemoved,
        })
    } catch (error) {
        return next(error);
    }
}
