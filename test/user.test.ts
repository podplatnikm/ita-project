import request from 'supertest';
import { expect } from 'chai';
import 'mocha';
import {
    BAD_REQUEST, NO_CONTENT, OK, UNAUTHORIZED,
} from 'http-status-codes';
import bcrypt from 'bcryptjs';
import app from '../src/Server';
import { loadRandomUser, setupDatabase } from './fixtures/setup';
import User from '../src/entity/User';
import {
    newPasswordMismatch, oldPasswordIncorrect, profoundWord, samePassword,
} from '../src/shared/constants';

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
        const { token } = await loadRandomUser();
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
                displayName: newDisplayName,
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
                password: newPassword,
            });

        expect(response.status).to.equal(BAD_REQUEST);
    });
    it('Should update/change password successfully', async () => {
        const { user, token, password } = await loadRandomUser();
        const newPassword = 'HawaiKukus';
        expect(password).to.not.equal(newPassword);

        const response = await request(app)
            .post('/api/users/me/password/change')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: password,
                newPassword,
                confirmNewPassword: newPassword,
            });

        expect(response.status).to.be.eq(OK);
        const fullUser = await User.findById(user._id).lean();
        const isMatch = await bcrypt.compare(newPassword, fullUser!.password);
        expect(isMatch).to.be.true;
    });
    it('Should only update if new passwords match', async () => {
        const { token, password } = await loadRandomUser();
        const newPassword = 'HawaiKukus';
        const confirmNewPassword = 'MojaAura';
        expect(password).to.not.equal(newPassword);
        expect(confirmNewPassword).to.not.equal(newPassword);

        const response = await request(app)
            .post('/api/users/me/password/change')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: password,
                newPassword,
                confirmNewPassword,
            });

        expect(response.status).to.be.eq(BAD_REQUEST);
        expect(response.body.message).to.be.eq(newPasswordMismatch);
    });
    it('Should only update if new password are not the same as old', async () => {
        const { token, password } = await loadRandomUser();
        const response = await request(app)
            .post('/api/users/me/password/change')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: password,
                newPassword: password,
                confirmNewPassword: password,
            });

        expect(response.status).to.be.eq(BAD_REQUEST);
        expect(response.body.message).to.be.eq(samePassword);
    });
    it('Should only update if old password is the actual password of the user', async () => {
        const { token, password } = await loadRandomUser();
        const oldPassword = 'tram11Vrucina';
        const newPassword = 'HawaiKukus';
        expect(password).to.not.equal(oldPassword);
        expect(password).to.not.equal(newPassword);

        const response = await request(app)
            .post('/api/users/me/password/change')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword,
                newPassword,
                confirmNewPassword: newPassword,
            });

        expect(response.status).to.be.eq(BAD_REQUEST);
        expect(response.body.message).to.be.eq(oldPasswordIncorrect);
    });
    describe('Favourites', () => {
        it('Should add a unique favourite', async () => {
            const { user, token } = await loadRandomUser();
            const newFavourite = 'italian';
            const existingFavourite = user.favourites.some((e) => e === newFavourite);
            expect(existingFavourite).to.be.false;

            const response = await request(app)
                .post('/api/users/me/favourites/add')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    item: newFavourite,
                });

            expect(response.status).to.eq(OK);
            const { favourites } = response.body;
            const newFavouriteExists = favourites.some((e: string) => e === newFavourite);
            expect(newFavouriteExists).to.be.true;
        });
        it('Should not add a profound word', async () => {
            const { token } = await loadRandomUser();

            const response = await request(app)
                .post('/api/users/me/favourites/add')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    item: 'ass',
                });

            expect(response.status).to.eq(BAD_REQUEST);
            expect(response.body.message).to.eq(profoundWord);
        });
        it('Should remove a favourite', async () => {
            const { user, token } = await loadRandomUser();
            const favourite = 'italian';
            const updatedUser = await User.findByIdAndUpdate(user._id,
                { favourites: [favourite] },
                { new: true });
            expect(updatedUser!.favourites.length).to.eq(1);

            const response = await request(app)
                .post('/api/users/me/favourites/remove')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    item: favourite,
                });

            expect(response.status).to.eq(OK);
            expect(response.body.favourites.length).to.eq(0);
        });
    });
});

describe('User Delete', () => {
    it('Should delete user', async () => {
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
    });
});
