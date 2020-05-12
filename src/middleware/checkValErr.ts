import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import { validationResult } from 'express-validator';

export const checkValErr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({ errors: errors.array() });
        }

        return next();
    } catch (error) {
        return res.status(BAD_REQUEST).send();
    }
};
