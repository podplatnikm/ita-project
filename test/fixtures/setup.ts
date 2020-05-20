import * as jwt from 'jsonwebtoken';
import User from '../../src/entity/User';
import config from '../../src/config/config';
import Attendee from '../../src/entity/Attendee';
import Meet from '../../src/entity/Meet';
import Event from '../../src/entity/Event';

export async function setupDatabase() {
    await User.deleteMany({});
    await Meet.deleteMany({});
    await Attendee.deleteMany({});
    await Event.deleteMany({});

    await User.createCollection();
    await Meet.createCollection();
    await Attendee.createCollection();
    await Event.createCollection();
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
