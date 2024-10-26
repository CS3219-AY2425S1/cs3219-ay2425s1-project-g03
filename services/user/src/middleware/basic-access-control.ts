import jwt from 'jsonwebtoken';
import { findUserById as _findUserById } from '../model/repository';
import { NextFunction, Request, Response } from 'express';
import { handleForbidden, handleUnauthorized } from '../utils/helper';
import config from '../config';

export function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        handleUnauthorized(res, 'Authenticated failed');
        return;
    }

    // request auth header: `Authorization: Bearer + <access_token>`
    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.JWT_SECRET, async (err, user) => {
        if (err || typeof user !== 'object' || !user?.id) {
            handleUnauthorized(res, 'Authentication failed');
            return;
        }

        // load latest user info from DB
        const dbUser = await _findUserById(user.id);
        if (!dbUser) {
            handleUnauthorized(res, 'Authentication failed');
            return;
        }

        req.user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            isAdmin: dbUser.isAdmin,
        };
        next();
    });
}

export function verifyIsAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.user.isAdmin) {
        next();
        return;
    }
    handleForbidden(res, 'Not authorized to access this resource');
}

export function verifyIsOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.user.isAdmin) {
        next();
        return;
    }

    const userIdFromReqParams = req.params.id;
    const userIdFromToken = req.user.id;
    if (userIdFromReqParams === userIdFromToken) {
        next();
        return;
    }

    handleForbidden(res, 'Not authorized to access this resource');
}
