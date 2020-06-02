import bcrypt from 'bcryptjs';
import {
    Document, Model, model, Schema,
} from 'mongoose';
import validator from 'validator';
import Attendee from './Attendee';
import Event from './Event';
import Meet, {IMeet} from './Meet';

const userSchema = new Schema({
    displayName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        unique: true,
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: 20,
        default: null,
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 30,
        default: null,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate: {
            validator(value: string) {
                return validator.isEmail(value);
            },
            message: (props) => `"${props.value}" is not a valid Email!`,
        },
        maxlength: 120,
    },
    password: {
        type: String,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    membership: [{
        role: {
            type: String,
            enum: ['user', 'restaurant', 'admin'],
            required: true,
        },
    }],
    receivePushNotifications: {
        type: Boolean,
        default: true,
    },
    hideEmail: {
        type: Boolean,
        default: false,
    },
    hideMe: {
        type: Boolean,
        default: false,
    },
    maxDistanceKm: {
        type: Number,
        default: 5,
        get: (v: number) => Math.round(v),
        set: (v: number) => Math.round(v),
        min: [1, 'Min distance should be at least 1'],
        max: [20, 'Max distance should be at most 20'],
    },
    favourites: {
        type: [String],
        default: [],
    },
    method: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    googleId: {
        type: String,
    },
}, {
    timestamps: true,
    minimize: false,
});

export interface IUser extends Document{
    id: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    active: boolean;
    membership: object[];
    method?: string;
    googleId?: string;
    favourites: string[];
}

userSchema.statics.findByCredentials = async function (email: string, password: string) {
    const User = this;

    const user = await User.findOne({
        email: email.toLowerCase(),
        method: 'local',
    });

    if (!user) {
        return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return null;
    }
    return user;
};

export interface IUserModel extends Model<IUser> {
    findByCredentials(email: string, password: string): IUser | null;
}

// Document middleware
userSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Document middleware
userSchema.post<IUser>('remove', async function (doc, next) {
    await Meet.deleteMany({ user: doc._id });
    await Event.deleteMany({ user: doc._id });
    await Attendee.deleteMany({ user: doc._id });
    next();
});

// Default export
export default model<IUser, IUserModel>('User', userSchema);
