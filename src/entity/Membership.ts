import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {IUser, User} from './User';
import {Account, IAccount} from './Account';

export interface IMembership {
    id: number,
    user?: IUser,
    account?: IAccount;
}

@Entity()
export class Membership extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;
    @ManyToOne(type => User, user => user.memberships)
    @JoinColumn({name: 'userId'})
    user: User;


    @Column()
    accountId: number;
    @ManyToOne(type => Account, account => account.memberships)
    @JoinColumn({name: 'accountId'})
    account: Account
}
