import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Membership} from './Membership';

export enum AccountRole {
    USER = 'user',
    RESTAURANT = 'restaurant',
    ADMIN = 'admin'
}

export interface IAccount {
    id: number,
    role: string,
    planLevel: number,
}

@Entity()
export class Account extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: AccountRole,
        default: AccountRole.USER
    })
    role: AccountRole;

    @OneToMany(type => Membership, membership => membership.account)
    memberships: Membership[]
}

