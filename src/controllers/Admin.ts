import {NextFunction, Request, Response} from 'express';
import Account from '@entities/Account';
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
import User from '@entities/User';
import Membership, {IMembership} from '@entities/Membership';

export async function addRole(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }

    try {
        const {user: userId, role} = req.body;
        let account = await Account.where({name: role}).fetch({require: false});

        if (!account) {
            return res.status(NOT_FOUND).send({success: false, message: roleNotExist})
        }
        account = account.toJSON();

        let user = await User.where({id: userId}).fetch({withRelated: ['memberships'], require: false});
        if (!user) {
            return res.status(NOT_FOUND).send({success: false, message: userNotExist})
        }
        user = user.toJSON();

        const roleAlreadyAssigned = user.memberships!.some((membership: IMembership) => {
            return membership.account_id === account.id
        });
        if (roleAlreadyAssigned) {
            return res.status(BAD_REQUEST).send({success: false, message: userAlreadyAssignedRole})
        }

        await Membership.forge({
            account_id: account.id,
            user_id: user.id
        }).save();

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
        let account = await Account.where({name: role}).fetch({require: false});

        if (!account) {
            return res.status(NOT_FOUND).send({success: false, message: roleNotExist})
        }
        account = account.toJSON();

        const membership = await Membership.where({user_id: userId, account_id: account.id}).fetch({require: false});
        if(!membership){
            return res.status(NOT_FOUND).send({success: false, message: membershipNotExist})
        }

        await membership.destroy();
        return res.status(OK).send({
            success: true,
            message: roleRemoved,
        })
    } catch (error) {
        return next(error);
    }
}
