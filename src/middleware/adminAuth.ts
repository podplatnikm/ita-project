import {NextFunction, Request, Response} from 'express';
import {UNAUTHORIZED} from 'http-status-codes';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user!;
        const isAdmin = user.membership!.some((membership: any) => {
            return membership.role === 'admin'
        });
        if (!isAdmin) {
            return res.status(UNAUTHORIZED).send();
        }
        return next();
    } catch (error) {
        return res.status(UNAUTHORIZED).send();
    }
};
