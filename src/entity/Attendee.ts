import {
    Document, Model, model, Schema,
} from 'mongoose';
import { IUser } from './User';
import { IMeet } from './Meet';

export const states = ['pending', 'accepted', 'declined'];

const attendeeSchema = new Schema({
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
    message: {
        type: String,
        trim: true,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    state: {
        type: String,
        enum: states,
        required: true,
    },
}, {
    timestamps: true,
    minimize: false,
});

export interface IAttendee extends Document {
    id: string;
    user: string | IUser;
    meet: string | IMeet;
    message?: string;
    seen: boolean;
    state: string;
}

export interface IAttendeeModel extends Model<IAttendee>{}

export default model<IAttendee, IAttendeeModel>('Attendee', attendeeSchema);
