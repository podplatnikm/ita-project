import {NextFunction, Request, Response} from 'express';
import {BAD_REQUEST, CREATED, OK, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import User, {IUser} from '@entities/User';
import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import {badCredentials, emailNotUnique, loginOk, registrationOk} from '@shared/constants';

export async function signupAuth(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }

    try {
        const {email, password, userName, firstName, lastName} = req.body;
        const emailExists = await User.where({email: email.toLowerCase()}).count();

        if (emailExists > 0) {
            return res.status(BAD_REQUEST).send({success: false, message: emailNotUnique});
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await User.forge({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            userName: userName.trim(),
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
            active: true,
        }).save();

        return res.status(CREATED).send({
            success: true,
            message: registrationOk,
        });

    } catch (error) {
        return next(error);
    }
}

export async function tokenAuth(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({errors: errors.array()});
    }

    try {
        const {email, password} = req.body;
        const user: IUser = await User.findByCredentials(email, password);

        if (!user) {
            return res.status(BAD_REQUEST).send({
                success: false,
                message: badCredentials,
            })
        }

        const token = jwt.sign({
            id: user.id,
            iat: Math.floor(Date.now() / 1000) - 30,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 31),
        }, config.jwtSecret);

        return res.status(OK).send({success: true, token, message: loginOk});
    } catch (error) {
        return next(error)
    }
}
