import { Types } from 'mongoose';
import { z } from 'zod';

export enum UserValidationErrors {
    REQUIRED = 'REQUIRED',
    INVALID = 'INVALID',
}

export interface RequestUser {
    id: Types.ObjectId | string;
    username: string;
    email: string;
    isAdmin: boolean;
}

export const userSchema = z.object({
    username: z
        .string({
            invalid_type_error: UserValidationErrors.INVALID,
            required_error: UserValidationErrors.REQUIRED,
        })
        .regex(/^[a-zA-Z0-9._-]+$/, UserValidationErrors.INVALID),
    email: z
        .string({
            invalid_type_error: UserValidationErrors.INVALID,
            required_error: UserValidationErrors.REQUIRED,
        })
        .email(UserValidationErrors.INVALID),
    password: z
        .string({
            invalid_type_error: UserValidationErrors.INVALID,
            required_error: UserValidationErrors.REQUIRED,
        })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!"#$%&'()*+,-.:;<=>?@\\/\\[\]^_`{|}~])/,
            UserValidationErrors.INVALID,
        ),
});
