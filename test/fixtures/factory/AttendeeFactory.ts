import { Types } from 'mongoose';
import Attendee from '../../../src/entity/Attendee';

export default class AttendeeFactory {
    _id: any;

    user: any;

    meet: any;

    message?: string;

    seen?: boolean;

    state?: string;

    constructor(userId: any, meetId: any, _id = Types.ObjectId()) {
        this._id = _id;
        this.user = userId;
        this.meet = meetId;
    }

    withRandomValues() {
        this.message = `message.${Date.now()}`;
        this.seen = false;
        this.state = 'accepted';
        return this;
    }

    setState(state: string) {
        this.state = state;
        return this;
    }

    build() {
        return new Attendee(this);
    }
}
