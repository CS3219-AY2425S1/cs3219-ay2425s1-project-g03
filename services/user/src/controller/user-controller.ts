import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import {
    createUser as _createUser,
    deleteUserById as _deleteUserById,
    findAllUsers as _findAllUsers,
    findUserByEmail as _findUserByEmail,
    findUserById as _findUserById,
    findUserByUsername as _findUserByUsername,
    findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
    updateUserById as _updateUserById,
    updateUserPrivilegeById as _updateUserPrivilegeById,
} from '../model/repository';
import { Request, Response } from 'express';
import { User } from '../model/user-model';
import {
    handleBadRequest,
    handleConflict,
    handleInternalError,
    handleNotFound,
    handleSuccess,
    handleUnauthorized,
} from '../utils/helper';
import {
    registrationSchema,
    updatePasswordSchema,
    updateUsernameAndEmailSchema,
    updateUserSchema,
    UserValidationErrors,
} from '../types/custom';

export async function createUser(req: Request, res: Response) {
    try {
        const parseResult = registrationSchema.safeParse(req.body);

        if (parseResult.success) {
            const { username, email, password } = req.body;
            const existingUser = await _findUserByUsernameOrEmail(username, email);
            if (existingUser) {
                handleConflict(res, 'username or email already exists');
                return;
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            const createdUser = await _createUser(username, email, hashedPassword);
            handleSuccess(res, 201, `Created new user ${username} successfully`, formatUserResponse(createdUser));
        } else {
            const required_errors = parseResult.error.errors.filter(
                err => err.message == UserValidationErrors.REQUIRED,
            );
            if (required_errors.length > 0) {
                handleBadRequest(res, 'username and/or email and/or password are missing');
            }
            handleBadRequest(res, 'invalid username and/or email and/or password');
        }
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when creating new user!');
    }
}

export async function getUser(req: Request, res: Response) {
    try {
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }

        const user = await _findUserById(userId);
        if (!user) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        } else {
            handleSuccess(res, 200, 'Found user', formatUserResponse(user));
        }
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when getting user!');
        return;
    }
}

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await _findAllUsers();
        handleSuccess(res, 200, 'Found users', users.map(formatUserResponse));
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when getting all users!');
    }
}

export async function updateUsernameAndEmail(req: Request, res: Response) {
    try {
        const parseResult = updateUsernameAndEmailSchema.safeParse(req.body);
        if (parseResult.success) {
            const { username, email, password } = req.body;

            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                handleNotFound(res, `User ${userId} not found`);
                return;
            }

            const userByUsername = await _findUserByUsername(username);
            if (userByUsername && userByUsername.id !== userId) {
                handleConflict(res, 'The username already exists');
                return;
            }
            const userByEmail = await _findUserByEmail(email);
            if (userByEmail && userByEmail.id !== userId) {
                handleConflict(res, 'The email already exists');
                return;
            }

            const userById = await _findUserById(userId);
            if (!userById) {
                handleNotFound(res, `User ${userId} not found`);
                return;
            }
            const match = await bcrypt.compare(password, userById.password);
            if (!match) {
                handleUnauthorized(res, 'Wrong password');
                return;
            }

            const updatedUser = (await _updateUserById(userId, username, email, userById.password)) as User;
            handleSuccess(res, 200, `Updated data for user ${userId}`, formatUserResponse(updatedUser));
        } else {
            console.log(parseResult.error.errors);
            const required_errors = parseResult.error.errors.filter(
                err => err.message == UserValidationErrors.REQUIRED,
            );
            if (required_errors.length > 0) {
                handleBadRequest(res, 'username and/or email and/or password are missing');
                return;
            }
            handleBadRequest(res, 'invalid username and/or email');
        }
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when updating user!');
        return;
    }
}

export async function updatePassword(req: Request, res: Response) {
    try {
        const parseResult = updatePasswordSchema.safeParse(req.body);
        if (parseResult.success) {
            const { oldPassword, newPassword } = req.body;

            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                handleNotFound(res, `User ${userId} not found`);
                return;
            }
            const userById = await _findUserById(userId);
            if (!userById) {
                handleNotFound(res, `User ${userId} not found`);
                return;
            }
            const match = await bcrypt.compare(oldPassword, userById.password);
            if (!match) {
                handleUnauthorized(res, 'Wrong password');
                return;
            }

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(newPassword, salt);

            const updatedUser = (await _updateUserById(
                userId,
                userById.username,
                userById.email,
                hashedPassword,
            )) as User;
            handleSuccess(res, 200, `Updated data for user ${userId}`, formatUserResponse(updatedUser));
        } else {
            const required_errors = parseResult.error.errors.filter(
                err => err.message == UserValidationErrors.REQUIRED,
            );
            if (required_errors.length > 0) {
                handleBadRequest(res, 'No field to update: username and email and password are all missing!');
            }
            handleBadRequest(res, 'invalid password');
        }
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when updating user!');
        return;
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const parseResult = updateUserSchema.safeParse(req.body);
        if (!parseResult.success) {
            const required_errors = parseResult.error.errors.filter(
                err => err.message == UserValidationErrors.REQUIRED,
            );
            if (required_errors.length > 0) {
                handleBadRequest(res, 'No field to update: username and email and password are all missing!');
                return;
            }
            handleBadRequest(res, 'invalid username and/or email and/or password');
            return;
        }

        const { username, email, password } = req.body;

        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }
        const user = await _findUserById(userId);
        if (!user) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }

        if (username || email) {
            const userByUsername = await _findUserByUsername(username);
            if (userByUsername && userByUsername.id !== userId) {
                handleConflict(res, 'username already exists');
                return;
            }
            const userByEmail = await _findUserByEmail(email);
            if (userByEmail && userByEmail.id !== userId) {
                handleConflict(res, 'email already exists');
                return;
            }
        }

        const salt = bcrypt.genSaltSync(10);
        const updatedUser = (await _updateUserById(
            userId,
            username ?? user.username, 
            email ?? user.email, 
            password ? bcrypt.hashSync(password, salt) : user.password
        )) as User;
        handleSuccess(res, 200, `Updated data for user ${userId}`, formatUserResponse(updatedUser));
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when updating user!');
        return;
    }
}

export async function updateUserPrivilege(req: Request, res: Response) {
    try {
        const { isAdmin } = req.body;

        if (isAdmin === undefined) {
            handleBadRequest(res, 'isAdmin is missing!');
            return;
        }

        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }
        const user = await _findUserById(userId);
        if (!user) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }

        const updatedUser = (await _updateUserPrivilegeById(userId, isAdmin === true)) as User;
        handleSuccess(res, 200, `Updated privilege for user ${userId}`, formatUserResponse(updatedUser));
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when updating user privilege!');
        return;
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }
        const user = await _findUserById(userId);
        if (!user) {
            handleNotFound(res, `User ${userId} not found`);
            return;
        }

        await _deleteUserById(userId);
        handleSuccess(res, 200, `Deleted user ${userId} successfully`);
        return;
    } catch (err) {
        console.error(err);
        handleInternalError(res, 'Unknown error when deleting user!');
        return;
    }
}

export function formatUserResponse(user: User) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
    };
}
