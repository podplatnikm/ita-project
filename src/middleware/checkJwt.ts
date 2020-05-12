import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UNAUTHORIZED } from 'http-status-codes';
import config from '../config/config';
import User from '../entity/User';


export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = (req.headers.authorization as string).replace('Bearer ', '');

        const jwtPayload = (jwt.verify(token, config.jwtSecret) as any);
        const user = await User.findOne({ _id: jwtPayload.id });
        if (!user || !user.active) {
            return res.status(UNAUTHORIZED).send();
        }
        (req as any).token = token;
        (req as any).user = user;
        return next();
    } catch (error) {
        return res.status(UNAUTHORIZED).send();
    }
};
