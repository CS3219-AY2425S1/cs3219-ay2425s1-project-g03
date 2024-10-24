// https://blog.logrocket.com/extend-express-request-object-typescript/

import { RequestUser } from './request';

export {};

declare global {
    namespace Express {
        export interface Request {
            user: RequestUser;
        }
    }
}
