import { NextFunction, Request, Response } from 'express';
import { CREATED, NO_CONTENT, OK } from 'http-status-codes';
import mongoose from 'mongoose';
import Meet from '../entity/Meet';
import Event from '../entity/Event';
import { meetListSerializer, meetRetrieveSerializer } from '../entity/serializers/meet';
import NotFoundError from '../shared/error/NotFoundError';
import {
    cannotAddParticipationToOwnMeet, meetAttendeeExists, meetStarted, notFound,
} from '../shared/constants';
import ValidationError from '../shared/error/ValidationError';
import Attendee, { states } from '../entity/Attendee';
import { attendeeListSerializer, attendeeRetrieveSerializer } from '../entity/serializers/attendee';
import User, { IUser } from '../entity/User';
import PermissionDeniedError from '../shared/error/PermissionDeniedError';

export async function listMeets(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;

        const myAccepted = await Attendee.find({ user: user._id, state: 'accepted' }).populate('meet');

        const otherMeets: any = [];
        myAccepted.forEach((attendee: any) => {
            otherMeets.push(attendee.meet);
        });

        return res.status(OK).send(meetListSerializer(otherMeets));
    } catch (error) {
        return next(error);
    }
}

export async function createMeet(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;

        const meet = new Meet({ ...req.body, user: user._id });

        const event = new Event({
            user: (req as any).user._id,
            meet: meet._id,
            description: `You created a meet @ ${meet.locationName}.`,
            title: 'Meet created!',
            type: 'notification',
        });

        const attendee = new Attendee({
            user: user._id,
            meet: meet._id,
            state: 'accepted',
            seen: true,
        });

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            meet.$session(session);
            event.$session(session);
            attendee.$session(session);
            await Promise.all([meet.save(), event.save(), attendee.save()]);
        });

        return res.status(CREATED).send(meetRetrieveSerializer(meet));
    } catch (error) {
        return next(error);
    }
}

export async function geoSearchMeet(req: Request, res: Response, next: NextFunction) {
    try {
        const { location } = req.body;
        const latlong = location.split(',');
        const coordinates = [parseFloat(latlong[1]), parseFloat(latlong[0])];

        const meets = await Meet.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates,
                    },
                    distanceField: 'distance',
                    spherical: true,
                },
            }, {
                $match: {
                    datetime: {
                        $gt: new Date(),
                    },
                    // user: {
                    //     $nin: [(req as any).user._id],
                    // },
                },
            },
        ]);
        return res.send(meets);
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

export async function updateMeet(req: Request, res: Response, next: NextFunction) {
    try {
        const { user } = req as any;
        const { id: meetId } = req.params;
        const { location, locationName } = req.body;

        const meet = await Meet.findOne({ user: user.id, _id: meetId });

        if (!meet) {
            throw new NotFoundError(notFound('Meet'));
        }

        if (meet.datetime < new Date()) {
            throw new PermissionDeniedError(meetStarted);
        }

        meet.location = location;
        meet.locationName = locationName;

        await meet.save();

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
        const { user }: { user: IUser } = req as any;

        if (!meet) {
            throw new NotFoundError(notFound('Meet'));
        }

        if (meet.user.toString() === user.id) {
            throw new PermissionDeniedError(cannotAddParticipationToOwnMeet);
        }

        const existingAttendee = await Attendee.findOne({ user: user.id, meet: meet.id });
        if (existingAttendee) {
            throw new ValidationError(meetAttendeeExists);
        }

        if (meet.datetime < new Date()) {
            throw new ValidationError(meetStarted);
        }

        const attendee = new Attendee({
            user: user._id,
            meet: meet._id,
            message,
            state: 'pending',
        });

        const event = new Event({
            user: (req as any).user._id,
            meet: meet._id,
            attendee: attendee._id,
            description: message,
            title: `${user.displayName} requested to join.`,
            type: 'request',
            actionRequired: true,
        });

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            event.$session(session);
            attendee.$session(session);
            await Promise.all([attendee.save(), event.save()]);
        });

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

        const targetUser = await User.findById(attendee.user);

        const oldState = attendee.state;
        attendee.state = state;

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            const promises = [];

            attendee.$session(session);
            promises.push(attendee.save());

            const eventUpdate = Event.updateMany(
                { meet: meetId, attendee: attendeeId },
                { actionRequired: false },
            ).session(session);
            promises.push(eventUpdate);

            if (attendee.state === 'accepted' && oldState !== 'accepted') {
                promises.push(Meet.findByIdAndUpdate(meet._id, {
                    $inc: {
                        totalParticipants: 1,
                    },
                }).session(session));
                const newEvent = new Event({
                    user: targetUser!._id,
                    meet: meet._id,
                    attendee: attendee._id,
                    description: `We have a new participant. ${targetUser!.firstName} '${targetUser!.displayName}' ${targetUser!.lastName} has been approved.`,
                    title: `${targetUser!.displayName} has joined.`,
                    type: 'notification',
                });
                newEvent.$session(session);
                promises.push(newEvent.save());
            }

            await Promise.all(promises);
        });

        return res.send(attendeeRetrieveSerializer(attendee));
    } catch (error) {
        return next(error);
    }
}
