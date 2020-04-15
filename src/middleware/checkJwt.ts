import {Request, Response, NextFunction} from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import {UNAUTHORIZED} from 'http-status-codes';
import {User} from '../entity/User';


export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = (req.headers.authorization as string).replace('Bearer ', '');

        const jwtPayload = (jwt.verify(token, config.jwtSecret) as any);
        // const user: User | null = await User.where({id: jwtPayload.id}).fetch({withRelated: ['memberships.account'], require: false});
        const user : User | undefined = await User.findOne({ id: jwtPayload.id });

        if (!user || !user.active) {
            return res.status(UNAUTHORIZED).send();
        }
        req.token = token;
        req.user = user;
        return next();
    } catch (error) {
        return res.status(UNAUTHORIZED).send();
    }
};
