import Database from '../db/bookshelf';
import bcrypt from 'bcryptjs';
import Bookshelf = require('bookshelf');
import Membership, {IMembership} from '@entities/Membership';

export interface IUser {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    active: boolean;
    memberships?: IMembership[]
    findByCredentials(email: string, password: string): IUser | null;
    toJSON(): IUser | IUser[];
}

export default class User extends Database.getInstance().getBookshelf().Model<IUser> {
    get tableName() { return 'users' }

    memberships(): Bookshelf.Collection<Membership> {
        return this.hasMany(Membership)
    }

    static async findByCredentials(email: string, password: string) {
        let user = await this.where({email}).fetch({require: false});
        if (!user) {
            return null;
        }
        user = user.toJSON();
        const doesPasswordMatch = await bcrypt.compare(password, user.password);
        if (!doesPasswordMatch) {
            return null;
        }
        return user;
    }
}
