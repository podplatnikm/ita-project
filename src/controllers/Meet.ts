import { NextFunction, Request, Response } from 'express';
import { CREATED, NO_CONTENT, OK } from 'http-status-codes';
import Meet from '../entity/Meet';
import { meetListSerializer, meetRetrieveSerializer } from '../entity/serializers/meet';
import NotFoundError from '../shared/error/NotFoundError';
import { notFound } from '../shared/constants';

export async function listMeets(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const meets = await Meet.find({ user: user.id });
        return res.status(OK).send(meetListSerializer(meets));
    } catch (error) {
        return next(error);
    }
}

export async function createMeet(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const meet = new Meet({ ...req.body, user: user._id });

        await meet.save();
        return res.status(CREATED).send(meetRetrieveSerializer(meet));
    } catch (error) {
        return next(error);
    }
}

export async function retrieveMeet(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const { id } = req.params;
        const meet = await Meet.findOne({ user: user.id, _id: id });

        if (!meet) {
            throw new NotFoundError(notFound('Meet'));
        }
        return res.status(OK).send(meetRetrieveSerializer(meet));
    } catch (error) {
        return next(error);
    }
}

export async function deleteMeet(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const { id } = req.params;

        const meet = await Meet.findOne({ user: user.id, _id: id });

        if (!meet) {
            throw new NotFoundError(notFound('Meet'));
        }

        await meet.remove();

        return res.status(NO_CONTENT).send();
    } catch (error) {
        return next(error);
    }
}
