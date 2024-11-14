import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { userSchema } from './request';
import { handleHttpBadRequest } from '../utils/helper';

export async function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return handleHttpBadRequest(res, 'Authentication failed: No token provided');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) {
            return handleHttpBadRequest(res, 'Authentication failed: Invalid token');
        }

        const result = userSchema.safeParse(user);
        if (result.error) {
            return handleHttpBadRequest(res, 'Authentication failed: Token validation error');
        }

        req.user = result.data;
        next();
    });
}
