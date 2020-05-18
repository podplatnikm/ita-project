import { NextFunction, Request, Response } from 'express';
import { CREATED, NO_CONTENT, OK } from 'http-status-codes';
import Meet from '../entity/Meet';
import { meetListSerializer, meetRetrieveSerializer } from '../entity/serializers/meet';
import NotFoundError from '../shared/error/NotFoundError';
import { meetAttendeeExists, meetStarted, notFound } from '../shared/constants';
import ValidationError from '../shared/error/ValidationError';
import Attendee, { states } from '../entity/Attendee';
import { attendeeListSerializer, attendeeRetrieveSerializer } from '../entity/serializers/attendee';

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

export async function createParticipation(req: Request, res: Response, next: NextFunction) {
    try {
        const { message } = req.body;
        const { id: meetId } = req.params;
        const meet = await Meet.findById(meetId);
        const { user } = req as any;

        if (!meet) {
            throw new NotFoundError(notFound('Meet'));
        }

        const existingAttendee = await Attendee.findOne({ user: user.id, meet: meet.id });
        if (existingAttendee) {
            throw new ValidationError(meetAttendeeExists);
        }

        if (meet.datetime < new Date()) {
            throw new ValidationError(meetStarted);
        }

        const attendee = new Attendee({
            user: (req as any).user._id,
            meet: meet._id,
            message,
            state: 'pending',
        });

        await attendee.save();

        return res.status(201).send(attendeeRetrieveSerializer(attendee));
    } catch (error) {
        return next(error);
    }
}

export async function listMeetAttendees(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const { id: meetId } = req.params;
        const { state } = req.query;

        const query: any = { meet: meetId };
        if (states.includes(state)) {
            query.state = state;
        }

        const meet = await Meet.findById(meetId);
        if (!meet || meet.user!.toString() !== user.id) {
            throw new NotFoundError(notFound('Meet'));
        }

        const attendees = await Attendee.find(query);

        return res.send(attendeeListSerializer(attendees));
    } catch (error) {
        return next(error);
    }
}

export async function vetoMeetAttendees(req: Request, res: Response, next: NextFunction) {
    try {
        const { meetId, attendeeId } = req.params;
        const { state } = req.body;
        const { user } = req as any;

        const meet = await Meet.findById(meetId);
        if (!meet || meet.user!.toString() !== user.id) {
            throw new NotFoundError(notFound('Meet'));
        }

        const attendee = await Attendee.findOne({ meet: meetId, _id: attendeeId });

        if (!attendee) {
            throw new NotFoundError(notFound('Attendee'));
        }

        attendee.state = state;
        await attendee.save();

        return res.send(attendeeRetrieveSerializer(attendee));
    } catch (error) {
        return next(error);
    }
}
