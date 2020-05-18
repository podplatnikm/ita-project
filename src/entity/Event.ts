import {
    model, Model, Schema, Document,
} from 'mongoose';
import { IUser } from './User';
import { IMeet } from './Meet';
import { IAttendee } from './Attendee';

export const eventTypes = ['notification', 'request'];

const eventSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    meet: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Meet',
    },
    attendee: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Attendee',
    },
    description: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: eventTypes,
        required: true,
    },
    actionRequired: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    minimize: false,
});

export interface IEvent extends Document{
    id: string;
    user: string | IUser;
    meet: string | IMeet;
    attendee?: string | IAttendee;
    description?: string;
    title: string;
    actionRequired: boolean;
}

export interface IEventModel extends Model<IEvent> {}

export default model<IEvent, IEventModel>('Event', eventSchema);
