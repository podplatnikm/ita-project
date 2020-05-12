import request from 'supertest';
import { expect } from 'chai';
import 'mocha';
import {
    BAD_REQUEST,
    CREATED, NOT_FOUND, OK, UNAUTHORIZED,
} from 'http-status-codes';
import app from '../src/Server';
import { loadRandomUser, setupDatabase } from './fixtures/setup';
import User from '../src/entity/User';
import { roleNotExist, userAlreadyAssignedRole } from '../src/shared/constants';

beforeEach(setupDatabase);

describe('Roles toggle', () => {
    describe('Addition', () => {
        it('Should prevent adding since is not admin', async () => {
            const { token } = await loadRandomUser();
            const { user: userTwo } = await loadRandomUser();
            const response = await request(app)
                .post('/api/admin/roles/add')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: userTwo.id,
                    role: 'admin',
                });

            expect(response.status).to.equal(UNAUTHORIZED);
        });
        it('Should add successfully', async () => {
            const { user: userOne, token } = await loadRandomUser();
            await User.findByIdAndUpdate(userOne._id, { $addToSet: { membership: { role: 'admin' } } });
            const { user: userTwo } = await loadRandomUser();
            const response = await request(app)
                .post('/api/admin/roles/add')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: userTwo.id,
                    role: 'admin',
                });

            expect(response.status).to.equal(CREATED);
            const fullUser = await User.findById(userTwo._id).lean();

            const adminRoleExists = fullUser!.membership.some((e) => (e as any).role === 'admin');
            expect(adminRoleExists).to.be.true;
        });
        it('Request body should include user and role', async () => {
            const { user: userOne, token } = await loadRandomUser();
            await User.findByIdAndUpdate(userOne._id, { $addToSet: { membership: { role: 'admin' } } });
            const response = await request(app)
                .post('/api/admin/roles/add')
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.equal(BAD_REQUEST);
        });
        it('Should not add a duplicate role', async () => {
            const { user: userOne, token } = await loadRandomUser();
            await User.findByIdAndUpdate(userOne._id, { $addToSet: { membership: { role: 'admin' } } });

            const { user: userTwo } = await loadRandomUser();
            const userRoleExists = userTwo!.membership.some((e) => (e as any).role === 'user');
            expect(userRoleExists).to.be.true;

            const response = await request(app)
                .post('/api/admin/roles/add')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: userTwo.id,
                    role: 'user',
                });

            expect(response.status).to.equal(BAD_REQUEST);
            expect(response.body.message).to.equal(userAlreadyAssignedRole);
        });
    });
    describe('Removal', () => {
        it('Should prevent removal since is not admin', async () => {
            const { token } = await loadRandomUser();
            const { user: userTwo } = await loadRandomUser();
            const response = await request(app)
                .post('/api/admin/roles/remove')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: userTwo.id,
                    role: 'user',
                });

            expect(response.status).to.equal(UNAUTHORIZED);
        });
        it('Should remove successfully', async () => {
            const { user: userOne, token } = await loadRandomUser();
            await User.findByIdAndUpdate(userOne._id, { $addToSet: { membership: { role: 'admin' } } });
            const { user: userTwo } = await loadRandomUser();
            const response = await request(app)
                .post('/api/admin/roles/remove')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: userTwo.id,
                    role: 'user',
                });

            expect(response.status).to.equal(OK);
            const fullUser = await User.findById(userTwo._id).lean();

            const adminRoleExists = fullUser!.membership.some((e) => (e as any).role === 'user');
            expect(adminRoleExists).to.be.false;
        });
        it('Request body should include user and role', async () => {
            const { user: userOne, token } = await loadRandomUser();
            await User.findByIdAndUpdate(userOne._id, { $addToSet: { membership: { role: 'admin' } } });
            const response = await request(app)
                .post('/api/admin/roles/remove')
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).to.equal(BAD_REQUEST);
        });
        it('Should only add a valid role', async () => {
            const { user: userOne, token } = await loadRandomUser();
            await User.findByIdAndUpdate(userOne._id, { $addToSet: { membership: { role: 'admin' } } });
            const { user: userTwo } = await loadRandomUser();
            const response = await request(app)
                .post('/api/admin/roles/remove')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: userTwo.id,
                    role: 'developer',
                });

            expect(response.status).to.equal(NOT_FOUND);
            expect(response.body.message).to.equal(roleNotExist);
        });
    });
});
