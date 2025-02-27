import { RequestUser } from './request';

declare global {
    namespace Express {
        export interface Request {
            user: RequestUser;
        }
    }
}
