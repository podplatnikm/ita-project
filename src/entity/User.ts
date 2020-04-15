import bcrypt from 'bcryptjs';
import { Document, Model, model, Schema } from 'mongoose'
import validator from 'validator';

const userSchema = new Schema({
    displayName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        unique: true
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
        default: null
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
            message: props => `"${props.value}" is not a valid Email!`,
        },
        maxlength: 120,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    membership: [{
        role: {
            type: String,
            enum: ['user', 'restaurant', 'admin'],
            required: true
        },
    }]
}, {
    timestamps: true
});

export interface IUser extends Document{
    displayName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    active: boolean;
    membership: object[];
}

userSchema.statics.findByCredentials = async function(email: string, password: string) {
    const User = this;

    const user = await User.findOne({
        email: email.toLowerCase()
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

// Document middlewares
userSchema.pre<IUser>('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next()
});

// Default export
export default model<IUser, IUserModel>('User', userSchema);
