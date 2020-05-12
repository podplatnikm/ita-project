import ApplicationError from './ApplicationError';

export default class ValidationError extends ApplicationError {
    constructor(message: string, detail = undefined) {
        super(message || 'Validation failed.', 400);
        if (detail !== undefined) (this as any).detail = detail;
    }
}
