import User from '../../src/entity/User';

declare global {
    namespace Express {
        export interface Request {
            user?: User;
            token?: string;
        }
    }
}
