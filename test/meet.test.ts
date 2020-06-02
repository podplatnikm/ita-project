import request from 'supertest';
import { expect } from 'chai';
import 'mocha';
import moment from 'moment';
import {
    BAD_REQUEST, CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND, OK,
} from 'http-status-codes';
import mongoose from 'mongoose';
import app from '../src/Server';
import { loadRandomUser, setupDatabase } from './fixtures/setup';
import MeetFactory from './fixtures/factory/MeetFactory';
import Meet from '../src/entity/Meet';
import AttendeeFactory from './fixtures/factory/AttendeeFactory';
import {
    cannotAddParticipationToOwnMeet, meetAttendeeExists, meetStarted, notFound,
} from '../src/shared/constants';

beforeEach(setupDatabase);

describe('Meet CRUD', () => {
    describe('Listing', () => {
        it('Should successfully list my meets.', async () => {
            const { user: userOne, token } = await loadRandomUser();
            const { user: userTwo } = await loadRandomUser();
            const meetOne = new MeetFactory(userOne.id).withRandomValues().build();
            const meetTwo = new MeetFactory(userTwo.id).withRandomValues().build();
            const attendeeOne = new AttendeeFactory(userOne.id, meetOne.id)
                .withRandomValues()
                .build();
            const attendeeTwo = new AttendeeFactory(userTwo.id, meetTwo.id)
                .withRandomValues()
                .build();
            await Promise.all([
                meetOne.save(),
                meetTwo.save(),
                attendeeOne.save(),
                attendeeTwo.save(),
            ]);

            const response = await request(app)
                .get('/api/meets/')
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.eq(OK);
            expect(response.body.length).to.eq(1);
            expect(response.body[0]._id).to.eq(meetOne.id);
        });
    });
    describe('Retrieval', () => {
        it('Should retrieve my meet', async () => {
            const { user: userOne, token } = await loadRandomUser();
            const meetOne = new MeetFactory(userOne.id).withRandomValues().build();
            await meetOne.save();

            const response = await request(app)
                .get(`/api/meets/${meetOne.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.eq(OK);
            expect(response.body._id).to.eq(meetOne.id);
        });
        it('Should not retrieve a meet, that I am not a owner of', async () => {
            const { token } = await loadRandomUser();
            const { user: userTwo } = await loadRandomUser();
            const meetOne = new MeetFactory(userTwo.id).withRandomValues().build();
            await meetOne.save();

            const response = await request(app)
                .get(`/api/meets/${meetOne.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.eq(OK);
        });
    });
    describe('Deletion', () => {
        it('Should delete only my meet', async () => {
            const { user: userOne, token } = await loadRandomUser();
            const meetOne = new MeetFactory(userOne.id).withRandomValues().build();
            await meetOne.save();

            const response = await request(app)
                .delete(`/api/meets/${meetOne.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.eq(NO_CONTENT);
            const meetInDb = await Meet.findById(meetOne._id);
            expect(meetInDb).to.eq(null);
        });
        it('Should not delete meets that other people created', async () => {
            const { token } = await loadRandomUser();
            const { user: userTwo } = await loadRandomUser();
            const meetOne = new MeetFactory(userTwo.id).withRandomValues().build();
            await meetOne.save();

            const response = await request(app)
                .delete(`/api/meets/${meetOne.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.eq(NOT_FOUND);
        });
    });
    describe('Creation', () => {
        it('Should create successfully', async () => {
            const { user, token } = await loadRandomUser();

            const data = {
                locationName: 'Tacos Lent',
                description: 'Dobimo se pred restavracijo Takos Lent folkzzz',
                datetime: '2020-05-14 12:00:00',
                location: {
                    type: 'Point',
                    coordinates: [15.644863, 46.556920],
                },
            };

            const response = await request(app)
                .post('/api/meets/')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(response.status).to.eq(CREATED);
            const meetInDb = await Meet.findById(response.body._id);
            expect(meetInDb!.user.toString()).to.eq(user.id);
            expect(meetInDb!.description).to.eq(data.description);
        });
        it('Should reject request with bad data', async () => {
            const { token } = await loadRandomUser();

            const data = {
                locationName: 'TI',
                description: '',
                datetime: 'not date',
                location: {
                    type: 'not Point',
                    coordinates: [200, 200],
                },
            };

            const response = await request(app)
                .post('/api/meets/')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(response.status).to.eq(BAD_REQUEST);
        });
    });
    describe('Update', () => {
        it('Should update location successfully', async () => {
            const { user, token } = await loadRandomUser();
            const meet = new MeetFactory(user.id).withRandomValues().build();
            await meet.save();

            const locationName = 'Falafel';
            const locationData = {
                type: 'Point',
                coordinates: [2, 2],
            };


            const response = await request(app)
                .put(`/api/meets/${meet.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    locationName,
                    location: locationData,
                });

            expect(response.status).to.eq(OK);
            const meetInDb = await Meet.findById(meet._id);
            expect(meetInDb!.locationName).to.eq(locationName);
        });
        it('Should throw error if request is badly formed', async () => {
            const { user, token } = await loadRandomUser();
            const meet = new MeetFactory(user.id).withRandomValues().build();
            await meet.save();

            const locationName = true;
            const locationData = [2, 2];

            const response = await request(app)
                .put(`/api/meets/${meet.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    locationName,
                    location: locationData,
                });

            expect(response.status).to.eq(BAD_REQUEST);
        });
        it('Should throw error if meet does not exist', async () => {
            const { user, token } = await loadRandomUser();
            const meet = new MeetFactory(user.id).withRandomValues().build();
            await meet.save();

            const locationName = 'Falafel';
            const locationData = {
                type: 'Point',
                coordinates: [2, 2],
            };

            const response = await request(app)
                .put(`/api/meets/${mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    locationName,
                    location: locationData,
                });

            expect(response.status).to.eq(NOT_FOUND);
        });
        it('Should throw error if meet is in the past', async () => {
            const { user, token } = await loadRandomUser();
            const meet = new MeetFactory(user.id)
                .withRandomValues()
                .setDatetime(moment().subtract(1, 'day').toDate())
                .build();
            await meet.save();

            const locationName = 'Falafel';
            const locationData = {
                type: 'Point',
                coordinates: [2, 2],
            };

            const response = await request(app)
                .put(`/api/meets/${meet.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    locationName,
                    location: locationData,
                });

            expect(response.status).to.eq(FORBIDDEN);
            expect(response.body.message).to.eq(meetStarted);
        });
    });
});

describe('Meet Search', () => {
    it("Should search for other people's meets successfully", async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();
        const meetOne = new MeetFactory(userOne.id)
            .withRandomValues()
            .setLocation({
                type: 'Point',
                coordinates: [1.000002, 1.000002],
            })
            .build();
        const meetTwo = new MeetFactory(userTwo.id)
            .withRandomValues()
            .setLocation({
                type: 'Point',
                coordinates: [1.000004, 1.000004],
            })
            .build();
        const attendeeOne = new AttendeeFactory(userOne.id, meetOne.id)
            .withRandomValues()
            .build();
        const attendeeTwo = new AttendeeFactory(userTwo.id, meetTwo.id)
            .withRandomValues()
            .build();
        await Promise.all([
            meetOne.save(),
            meetTwo.save(),
            attendeeOne.save(),
            attendeeTwo.save(),
        ]);

        const response = await request(app)
            .post('/api/meets/geo-search/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                location: '1,1',
            });

        expect(response.status).to.eq(OK);
        expect(response.body.length).to.eq(1);
        expect(response.body[0]._id).to.eq(meetTwo.id);
    });
    it('Should return error if the data is not in latlong format', async () => {
        const { token } = await loadRandomUser();

        const response = await request(app)
            .post('/api/meets/geo-search/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                location: '200,100,1',
            });

        expect(response.status).to.eq(BAD_REQUEST);
    });
    it('It should not find past meets', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();
        const meetOne = new MeetFactory(userTwo.id)
            .withRandomValues()
            .setLocation({
                type: 'Point',
                coordinates: [1, 1],
            })
            .build();
        const meetTwo = new MeetFactory(userTwo.id)
            .withRandomValues()
            .setDatetime(moment().subtract(1, 'day').toDate())
            .setLocation({
                type: 'Point',
                coordinates: [1, 1],
            })
            .build();
        const attendeeOne = new AttendeeFactory(userOne.id, meetOne.id)
            .withRandomValues()
            .build();
        const attendeeTwo = new AttendeeFactory(userOne.id, meetTwo.id)
            .withRandomValues()
            .build();
        await Promise.all([
            meetOne.save(),
            meetTwo.save(),
            attendeeOne.save(),
            attendeeTwo.save(),
        ]);

        const response = await request(app)
            .post('/api/meets/geo-search/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                location: '1,1',
            });

        expect(response.status).to.eq(OK);
        expect(response.body.length).to.eq(1);
        expect(response.body[0]._id).to.eq(meetOne.id);
    });
    it('Should not list meets that are far away', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();
        const meetOne = new MeetFactory(userTwo.id)
            .withRandomValues()
            .setLocation({
                type: 'Point',
                coordinates: [90, 90],
            })
            .build();
        const meetTwo = new MeetFactory(userTwo.id)
            .withRandomValues()
            .setLocation({
                type: 'Point',
                coordinates: [1, 1],
            })
            .build();
        const attendeeOne = new AttendeeFactory(userOne.id, meetOne.id)
            .withRandomValues()
            .build();
        const attendeeTwo = new AttendeeFactory(userOne.id, meetTwo.id)
            .withRandomValues()
            .build();
        await Promise.all([
            meetOne.save(),
            meetTwo.save(),
            attendeeOne.save(),
            attendeeTwo.save(),
        ]);

        const response = await request(app)
            .post('/api/meets/geo-search/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                location: '1,1',
            });

        expect(response.status).to.eq(OK);
        expect(response.body.length).to.eq(1);
        expect(response.body[0]._id).to.eq(meetTwo.id);
    });
});

describe('Meet Attending', () => {
    it('Should successfully request to join', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userTwo.id)
            .withRandomValues()
            .build();
        await meet.save();

        const response = await request(app)
            .post(`/api/meets/${meet.id}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Pls join',
            });

        expect(response.status).to.eq(CREATED);
        expect(response.body.meet).to.eq(meet.id);
        expect(response.body.user).to.eq(userOne.id);
    });
    it('Should throw error if meet does not exist', async () => {
        const { token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userTwo.id)
            .withRandomValues()
            .build();
        await meet.save();

        const response = await request(app)
            .post(`/api/meets/${mongoose.Types.ObjectId()}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Pls join',
            });

        expect(response.status).to.eq(NOT_FOUND);
        expect(response.body.message).to.eq(notFound('Meet'));
    });
    it('Should throw error if you try to join own meet', async () => {
        const { user, token } = await loadRandomUser();

        const meet = new MeetFactory(user.id)
            .withRandomValues()
            .build();
        await meet.save();

        const response = await request(app)
            .post(`/api/meets/${meet.id}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Pls join',
            });

        expect(response.status).to.eq(FORBIDDEN);
        expect(response.body.message).to.eq(cannotAddParticipationToOwnMeet);
    });
    it('Should throw error if you try to join a meet again', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userTwo.id)
            .withRandomValues()
            .build();
        const attendee = new AttendeeFactory(userOne.id, meet.id)
            .withRandomValues()
            .build();

        await Promise.all([meet.save(), attendee.save()]);

        const response = await request(app)
            .post(`/api/meets/${meet.id}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Pls join',
            });

        expect(response.status).to.eq(BAD_REQUEST);
        expect(response.body.message).to.eq(meetAttendeeExists);
    });
    it('Should throw error if you try to join a meet in the past', async () => {
        const { token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userTwo.id)
            .withRandomValues()
            .setDatetime(moment().subtract(1, 'day').toDate())
            .build();
        await meet.save();

        const response = await request(app)
            .post(`/api/meets/${meet.id}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Pls join',
            });

        expect(response.status).to.eq(BAD_REQUEST);
        expect(response.body.message).to.eq(meetStarted);
    });
    it('Should list all meet participants', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userOne.id)
            .withRandomValues()
            .build();
        const attendeeOne = new AttendeeFactory(userOne.id, meet.id)
            .withRandomValues()
            .build();
        const attendeeTwo = new AttendeeFactory(userTwo.id, meet.id)
            .withRandomValues()
            .build();

        await Promise.all([meet.save(), attendeeOne.save(), attendeeTwo.save()]);

        const response = await request(app)
            .get(`/api/meets/${meet.id}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.status).to.eq(OK);
        expect(response.body.length).to.eq(2);
    });
    it('Should throw error if meet does not exist', async () => {
        const { user, token } = await loadRandomUser();

        const meet = new MeetFactory(user.id)
            .withRandomValues()
            .build();
        await meet.save();

        const response = await request(app)
            .get(`/api/meets/${mongoose.Types.ObjectId()}/attendees`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.status).to.eq(OK);
    });
    it('Should veto attendee successfully', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userOne.id)
            .withRandomValues()
            .build();
        const attendee = new AttendeeFactory(userTwo.id, meet.id)
            .withRandomValues()
            .setState('pending')
            .build();

        await Promise.all([meet.save(), attendee.save()]);
        const state = 'accepted';

        const response = await request(app)
            .put(`/api/meets/${meet.id}/attendees/${attendee.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                state,
            });

        expect(response.status).to.eq(OK);
        expect(response.body.state).to.eq(state);
    });
    it('Should throw error on vote when you are not the owner of meet', async () => {
        const { token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userTwo.id)
            .withRandomValues()
            .build();
        const attendee = new AttendeeFactory(userTwo.id, meet.id)
            .withRandomValues()
            .setState('pending')
            .build();

        await Promise.all([meet.save(), attendee.save()]);
        const state = 'accepted';

        const response = await request(app)
            .put(`/api/meets/${meet.id}/attendees/${attendee.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                state,
            });

        expect(response.status).to.eq(NOT_FOUND);
        expect(response.body.message).to.eq(notFound('Meet'));
    });
    it('Should throw error on vote when you are not the owner of meet', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userOne.id)
            .withRandomValues()
            .build();
        const attendee = new AttendeeFactory(userTwo.id, meet.id)
            .withRandomValues()
            .setState('pending')
            .build();

        await Promise.all([meet.save(), attendee.save()]);
        const state = 'accepted';

        const response = await request(app)
            .put(`/api/meets/${meet.id}/attendees/${mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                state,
            });

        expect(response.status).to.eq(NOT_FOUND);
        expect(response.body.message).to.eq(notFound('Attendee'));
    });
    it('Should throw error on vote when you are passing illegal state', async () => {
        const { user: userOne, token } = await loadRandomUser();
        const { user: userTwo } = await loadRandomUser();

        const meet = new MeetFactory(userOne.id)
            .withRandomValues()
            .build();
        const attendee = new AttendeeFactory(userTwo.id, meet.id)
            .withRandomValues()
            .setState('pending')
            .build();

        await Promise.all([meet.save(), attendee.save()]);
        const state = 'pending';

        const response = await request(app)
            .put(`/api/meets/${meet.id}/attendees/${attendee.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                state,
            });

        expect(response.status).to.eq(BAD_REQUEST);
    });
});
