import Database from '../db/bookshelf';
import User from '@entities/User';
import Account, {IAccount} from '@entities/Account';

export interface IMembership {
    id: number,
    user_id: number,
    account_id: number,
    account?: IAccount;
}

export default class Membership extends Database.getInstance().getBookshelf().Model<IMembership> {
    get tableName() { return 'memberships'}

    user(): User {
        return this.belongsTo(User)
    }

    account(): Account {
        return this.belongsTo(Account)
    }
}
