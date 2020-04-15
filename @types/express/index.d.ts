import {IUser} from '@entities/User';

declare global {
    namespace Express {
        export interface Request {
            user?: IUser;
            token?: string;
        }
    }
}
