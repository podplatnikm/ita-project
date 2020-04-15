import app from '../src/Server'
import request from 'supertest';
import { expect } from 'chai';
import 'mocha';
import {loadRandomUser, setupDatabase} from './fixtures/setup';
import {BAD_REQUEST, OK, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {badCredentials, emailNotUnique, weakPassword} from '../src/shared/constants';

beforeEach(setupDatabase);

describe('Registration', () => {
    it('Should register successfully', async () => {
        const data = {
            'email': 'debora.deluca@student.um.si',
            'displayName': 'Deborah De Luca',
            'firstName': 'Deborah',
            'lastName': 'De Luca',
            'password': 'testpassword'
        };
        const response = await request(app).post('/api/auth/sign-up').send(data);
        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);
    });
    it('Should return error if request does not include required fields', async () => {
        const data = {
            'displayName': 'Deborah De Luca',
            'firstName': 'Deborah',
            'lastName': 'De Luca',
            'password': 'testpassword'
        };
        const response = await request(app).post('/api/auth/sign-up').send(data);
        expect(response.status).to.equal(UNPROCESSABLE_ENTITY);
    });
    it('Should prevent double email (email should be unique)', async () => {
        const {user} = await loadRandomUser();
        const data = {
            'email': user.email,
            'displayName': 'Deborah De Luca',
            'firstName': 'Deborah',
            'lastName': 'De Luca',
            'password': 'testpassword'
        };
        const response = await request(app).post('/api/auth/sign-up').send(data);
        expect(response.status).to.equal(BAD_REQUEST);
        expect(response.body.message).to.equal(emailNotUnique);
    });
    it('Should prevent weak passwords', async () => {
        const data = {
            'email': 'debora.deluca@student.um.si',
            'displayName': 'Deborah De Luca',
            'firstName': 'Deborah',
            'lastName': 'De Luca',
            'password': '12345'
        };
        const response = await request(app).post('/api/auth/sign-up').send(data);
        expect(response.status).to.equal(BAD_REQUEST);
        expect(response.body.message).to.equal(weakPassword);
    })
});

describe('Login', () => {
    it ('Should login successfully', async () => {
        const {user, password} = await loadRandomUser();
        const data = {
            email: user.email,
            password
        };
        const response = await request(app).post('/api/auth/token').send(data);
        expect(response.status).to.equal(OK);
    });
    it ('Should login unsuccessfully', async () => {
        const {user, password} = await loadRandomUser();
        const data = {
            email: user.email,
            password: password + '123'
        };
        const response = await request(app).post('/api/auth/token').send(data);
        expect(response.status).to.equal(BAD_REQUEST);
        expect(response.body.message).to.equal(badCredentials);
    })
});
