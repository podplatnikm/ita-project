import {
    model, Model, Schema, Document,
} from 'mongoose';
import { IUser } from './User';
import bcrypt from 'bcryptjs';
import Attendee from './Attendee';
import Event from './Event';

const meetSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number], // First longitude[-180|180], then latitude [-90|90]
            required: true,
        },
    },
    locationName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    datetime: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    totalParticipants: {
        type: Number,
        min: 1,
        get: (v: any) => Math.round(v),
        set: (v: any) => Math.round(v),
        default: 1,
    },
}, {
    timestamps: true,
    minimize: false,
});

interface ILocation {
    type: string;
    coordinates: number[];
}

export interface IMeet extends Document {
    _id: any;
    id: string;
    user: string | IUser;
    location: ILocation;
    locationName: string;
    datetime: Date;
    description?: string;
}

export interface IMeetModel extends Model<IMeet> {}

meetSchema.index({
    location: '2dsphere',
});


// Document middleware
meetSchema.post<IMeet>('remove', async function (doc, next) {
    await Attendee.deleteMany({ meet: doc._id });
    await Event.deleteMany({ meet: doc._id });
    next();
});

export default model<IMeet, IMeetModel>('Meet', meetSchema);
