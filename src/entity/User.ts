import bcrypt from 'bcryptjs';
import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {IMembership, Membership} from './Membership';

export interface IUser {
    id: number;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    active: boolean;
    memberships?: IMembership[]
    findByCredentials(email: string, password: string): IUser | null;
}

@Entity()
@Unique(['displayName'])
@Unique(['email'])
export class User extends BaseEntity implements IUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 20
    })
    displayName: string;

    @Column({
            length: 20, nullable: true
        }
    )
    firstName: string;

    @Column({
        length: 30, nullable: true
    })
    lastName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    active: boolean;

    @OneToMany(type => Membership, membership => membership.user)
    memberships: Membership[];

    static async findByCredentials(email: string, password: string) {
        const user : User | undefined = await this.findOne({email});
        if (!user) {
            return undefined;
        }
        const doesPasswordMatch = await bcrypt.compare(password, user.password);
        if (!doesPasswordMatch) {
            return undefined;
        }
        return user;
    }
}
