import ApplicationError from './ApplicationError';

export default class NotFoundError extends ApplicationError {
    constructor(message: string, detail = undefined) {
        super(message || 'Validation failed.', 404);
        if (detail !== undefined) (this as any).detail = detail;
    }
}
