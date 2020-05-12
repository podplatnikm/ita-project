import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
/**
 * Class representing a default Application Error
 */

export default class ApplicationError extends Error {
    constructor(message: string, status: number) {
        super();

        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'Something went wrong. Please try again.';
        (this as any).status = status || INTERNAL_SERVER_ERROR;
    }
}
