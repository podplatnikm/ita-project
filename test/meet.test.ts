import request from 'supertest';
import { expect } from 'chai';
import 'mocha';
import {
    BAD_REQUEST, CREATED, NO_CONTENT, NOT_FOUND, OK,
} from 'http-status-codes';
import app from '../src/Server';
import { loadRandomUser, setupDatabase } from './fixtures/setup';
import MeetFactory from './fixtures/factory/MeetFactory';
import Meet from '../src/entity/Meet';

beforeEach(setupDatabase);

describe('Meet CRUD', () => {
    describe('Listing', () => {
        it('Should successfully list my meets.', async () => {
            const { user: userOne, token } = await loadRandomUser();
            const { user: userTwo } = await loadRandomUser();
            const meetOne = new MeetFactory(userOne.id).withRandomValues().build();
            const meetTwo = new MeetFactory(userTwo.id).withRandomValues().build();
            await Promise.all([meetOne.save(), meetTwo.save()]);

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

            expect(response.status).to.eq(NOT_FOUND);
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
});
