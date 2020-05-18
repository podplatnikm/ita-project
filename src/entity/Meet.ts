import {
    model, Model, Schema, Document,
} from 'mongoose';
import { IUser } from './User';

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
    user?: string | IUser;
    location: ILocation;
    locationName: string;
    datetime: Date;
    description?: string;
}

export interface IMeetModel extends Model<IMeet> {}

export default model<IMeet, IMeetModel>('Meet', meetSchema);
