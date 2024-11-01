import { Types } from 'mongoose';
import { z } from 'zod';

export enum Role {
    Admin = 'admin',
    User = 'user',
}

export interface RequestUser {
    id: string;
    username: string;
    role: Role;
}

export const userSchema = z.object({
    id: z.string(),
    username: z.string(),
    role: z.nativeEnum(Role),
});
