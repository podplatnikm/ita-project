import * as jwt from 'jsonwebtoken';
import User from '../../src/entity/User';
import config from '../../src/config/config';

export async function setupDatabase() {
    await User.deleteMany({});
}

export async function loadRandomUser() {
    const password = 'testpassword';
    const user = new User({
        email: `mitja.viler.${Date.now()}@gmail.com`,
        displayName: `Rulo.${Date.now()}`,
        password,
        membership: [{
            role: 'user',
        }],
    });

    const token = jwt.sign({
        id: user.id,
        iat: Math.floor(Date.now() / 1000) - 30,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 31),
    }, config.jwtSecret);

    await user.save();
    return { user, password, token };
}
