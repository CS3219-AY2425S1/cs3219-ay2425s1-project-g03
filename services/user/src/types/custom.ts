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

export const usernameSchema = z
    .string({
        invalid_type_error: UserValidationErrors.INVALID,
        required_error: UserValidationErrors.REQUIRED,
    })
    .regex(/^[a-zA-Z0-9._-]+$/, UserValidationErrors.INVALID);

export const emailSchema = z
    .string({
        invalid_type_error: UserValidationErrors.INVALID,
        required_error: UserValidationErrors.REQUIRED,
    })
    .email(UserValidationErrors.INVALID);

export const passwordSchema = z
    .string({
        invalid_type_error: UserValidationErrors.INVALID,
        required_error: UserValidationErrors.REQUIRED,
    })
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!"#$%&'()*+,-.:;<=>?@\\/\\[\]^_`{|}~])/,
        UserValidationErrors.INVALID,
    );

export const registrationSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export const updateUserSchema = z.object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
}).superRefine((data, ctx) => {
    if (!data.username && !data.email && !data.password) {
        // If none of the variables are present, assign error to each one
        // Granular control over which is missing is not needed
        ctx.addIssue({
          path: ['username', 'password', 'email'],
          message: UserValidationErrors.REQUIRED,
          code: z.ZodIssueCode.custom,
        });
      }
});

export const updateUsernameAndEmailSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: z.string({
        invalid_type_error: UserValidationErrors.INVALID,
        required_error: UserValidationErrors.REQUIRED,
    }),
});

export const updatePasswordSchema = z.object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
});
