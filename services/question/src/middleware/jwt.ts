import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { Role, userSchema } from '../types/request';
import { handleForbidden, handleUnauthorized } from '../utils/helpers';

export async function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        handleUnauthorized(res, 'Authenticated failed');
        return;
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.JWT_SECRET, async (err, user) => {
        const result = userSchema.safeParse(user);
        if (err || result.error) {
            handleUnauthorized(res, 'Authentication failed');
            return;
        }

        req.user = result.data;
        next();
    });
}

export function verifyIsAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.user.role === Role.Admin) {
        next();
        return;
    }
    handleForbidden(res, 'Not authorized to access this resource');
}
