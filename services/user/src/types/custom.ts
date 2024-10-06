import { Types } from 'mongoose';

export interface RequestUser {
    id: Types.ObjectId | string;
    username: string;
    email: string;
    password?: string;
    createdAt?: Date;
    isAdmin: boolean;
}
