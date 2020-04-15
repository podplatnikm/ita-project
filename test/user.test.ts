import app from '../src/Server'
import request from 'supertest';
import { expect } from 'chai';
import 'mocha';
import {loadRandomUser, setupDatabase} from './fixtures/setup';
import {BAD_REQUEST, NO_CONTENT, OK, UNAUTHORIZED} from 'http-status-codes';
import User from '../src/entity/User';

beforeEach(setupDatabase);

describe('User Info Retrieve', () => {
    it('Should retrieve user info', async () => {
        const { user, token } = await loadRandomUser();
        const response = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.status).to.equal(200);
        expect(response.body.id).to.equal(user.id);
        expect(response.body.email).to.equal(user.email);
    });
    it('Should not allow unauthorized access', async () => {
        const response = await request(app)
            .get('/api/users/me')
            .send();

        expect(response.status).to.equal(UNAUTHORIZED);
    });
});

describe('User list', () => {
    it('Should list all users', async () => {
        const { user, token } = await loadRandomUser();
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.status).to.equal(OK);
        expect(response.body.length).to.equal(1);
    });
});

describe('User Update', () => {
    it('Should successfully update fields', async () => {
        const { user, token } = await loadRandomUser();
        const newDisplayName = 'Hawai';
        expect(user.displayName).to.not.equal(newDisplayName);

        const response = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({
                displayName: newDisplayName
            });

        expect(response.status).to.equal(OK);
        expect(response.body.displayName).to.equal(newDisplayName);

        const databaseUser = await User.findById(user._id);
        expect(databaseUser!.displayName).to.be.equal(newDisplayName);
    });
    it('Should not update if request body includes restricted fields', async () => {
        const { token, password } = await loadRandomUser();
        const newPassword = 'HawaiKukus';
        expect(password).to.not.equal(newPassword);

        const response = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: newPassword
            });

        expect(response.status).to.equal(BAD_REQUEST);
    });
});

describe('User Delete', () => {
    it.only('Should delete user', async () => {
        const { user, token } = await loadRandomUser();
        let userInDatabase = await User.findById(user._id);
        expect(userInDatabase!.id).to.be.equal(user.id);

        const response = await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.status).to.be.equal(NO_CONTENT);
        userInDatabase = await User.findById(user._id);
        expect(userInDatabase).to.be.equal(null);
    })
});
