import { Types } from 'mongoose';
import { z } from 'zod';

export type IdType = string | Types.ObjectId;

export enum Role {
    Admin = 'admin',
    User = 'user',
}

export interface RequestUser {
    id: IdType;
    username: string;
    role: Role;
}

export const userSchema = z.object({
    id: z.string(),
    username: z.string(),
    role: z.nativeEnum(Role),
});
