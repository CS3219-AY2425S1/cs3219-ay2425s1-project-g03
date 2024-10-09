import { NextFunction, Request, Response } from 'express';
import { handleInternalError, handleUnauthorized } from '../utils/responses';
import { VerifyTokenResponse } from '../types/response';
import axios from 'axios';

export async function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        handleUnauthorized(res, 'Authenticated failed');
        return;
    }
    try {
        console.log(authHeader);
        const response = await axios.get<VerifyTokenResponse>('http://user:8082/auth/verify-token', {
            headers: { authorization: authHeader },
        });
        req.user = response.data.data;
        next();
    } catch (error: any) {
        if (error?.response?.status == 401) {
            handleUnauthorized(res);
            return;
        }

        console.error(error);
        handleInternalError(res);
        return;
    }
}
