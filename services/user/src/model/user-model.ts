import mongoose, { Types } from 'mongoose';

const Schema = mongoose.Schema;

export enum Role {
    Admin = 'admin',
    User = 'user',
}

export interface User {
    id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    isAdmin: boolean;
}

const UserModelSchema = new Schema<User>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Setting default to the current date/time
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
});

export default mongoose.model('UserModel', UserModelSchema);
