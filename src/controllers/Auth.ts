import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import config from '../config/config';
import {
    badCredentials, emailNotUnique, loginOk, registrationOk, weakPassword,
} from '../shared/constants';
import Validator from '../util/Validator';
import User, { IUser } from '../entity/User';

export async function signupAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            email, password, displayName, firstName, lastName,
        } = req.body;
        const emailExists = await User.countDocuments({ email: email.toLowerCase() });

        if (emailExists > 0) {
            return res.status(BAD_REQUEST).send({ success: false, message: emailNotUnique });
        }

        if (!await Validator.validatePasswordStrength(password)) {
            return res.status(BAD_REQUEST).send({ success: false, message: weakPassword });
        }

        const user = new User({
            email: email.toLowerCase().trim(),
            password,
            displayName: displayName.trim(),
            firstName,
            lastName,
            membership: [{
                role: 'user',
            }],
            method: 'local',
        });
        await user.save();

        return res.status(CREATED).send({
            success: true,
            message: registrationOk,
        });
    } catch (error) {
        return next(error);
    }
}

export async function tokenAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);

        if (!user) {
            return res.status(BAD_REQUEST).send({
                success: false,
                message: badCredentials,
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
}

export async function returnToken(req: Request, res: Response, next: NextFunction) {
    try {
        const { user }: { user: IUser } = (req as any);

        const token = jwt.sign({
            id: user!.id,
            iat: Math.floor(Date.now() / 1000) - 30,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 31 * 6),
        }, config.jwtSecret);

        return res.status(OK).send({ success: true, token, message: loginOk });
    } catch (error) {
        return next(error);
    }
}
