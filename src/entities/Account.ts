import Database from '../db/bookshelf';
import Membership from '@entities/Membership';
import Bookshelf = require('bookshelf');

export interface IAccount {
    id: number,
    name: string,
    planLevel: number,
}

export default class Account extends Database.getInstance().getBookshelf().Model<IAccount> {
    get tableName() { return 'accounts'}

    memberships(): Bookshelf.Collection<Membership> {
        return this.hasMany(Membership)
    }
}
