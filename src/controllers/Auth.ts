import {NextFunction, Request, Response} from 'express';
import {BAD_REQUEST, CREATED, OK, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import {badCredentials, emailNotUnique, loginOk, registrationOk, weakPassword} from '@shared/constants';
import {User} from '../entity/User';
import Validator from '../util/Validator';

export async function signupAuth(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({errors: errors.array()});
    }

    try {
        const {email, password, displayName, firstName, lastName} = req.body;
        const emailExists = await User.find({email: email.toLowerCase()});

        if (emailExists.length > 0) {
            return res.status(BAD_REQUEST).send({success: false, message: emailNotUnique});
        }

        if (!await Validator.validatePasswordStrength(password)) {
            return res.status(BAD_REQUEST).send({success: false, message: weakPassword});
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const user = new User();
        user.email = email.toLowerCase().trim();
        user.password = hashedPassword;
        user.displayName = displayName.trim();
        user.firstName = firstName;
        user.lastName = lastName;
        user.active = true;
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({errors: errors.array()});
    }

    try {
        const {email, password} = req.body;
        const user: User | undefined = await User.findByCredentials(email, password);

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
