import ApplicationError from './ApplicationError';

export default class PermissionDeniedError extends ApplicationError {
    constructor(message: string, detail = undefined) {
        super(message || 'Validation failed.', 403);
        if (detail !== undefined) (this as any).detail = detail;
    }
}
