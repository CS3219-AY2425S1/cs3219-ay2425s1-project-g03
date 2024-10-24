import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername as _findUserByUsername } from '../model/repository';
import { formatUserResponse } from './user-controller';
import { Request, Response } from 'express';
import { handleBadRequest, handleInternalError, handleSuccess, handleUnauthorized } from '../utils/helper';
import config from '../config';

export async function handleLogin(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!(username && password)) {
        handleBadRequest(res, 'Missing username and/or password');
        return;
    }

    try {
        const user = await _findUserByUsername(username);
        if (!user) {
            handleUnauthorized(res, 'Wrong username and/or password');
            return;
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            handleUnauthorized(res, 'Wrong username and/or password');
            return;
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
            },
            config.JWT_SECRET,
            {
                expiresIn: '1d',
            },
        );
        handleSuccess(res, 200, 'User logged in', {
            accessToken,
            ...formatUserResponse(user),
        });
        return;
    } catch (err) {
        console.error(err);
        handleInternalError(res);
        return;
    }
}

export async function handleVerifyToken(req: Request, res: Response) {
    try {
        const verifiedUser = req.user;
        handleSuccess(res, 200, 'Token verified', verifiedUser);
    } catch (err) {
        console.error(err);
        handleInternalError(res);
    }
}
