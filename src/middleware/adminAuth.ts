import {NextFunction, Request, Response} from 'express';
import {UNAUTHORIZED} from 'http-status-codes';
import {IMembership} from "../entity/Membership";

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const isAdmin = user.memberships!.some((membership: IMembership) => {
            return membership.account && membership.account.name === 'admin'
        });
        if (!isAdmin) {
            return res.status(UNAUTHORIZED).send();
        }
        return next();
    }catch (error) {
        return res.status(UNAUTHORIZED).send();
    }
};
