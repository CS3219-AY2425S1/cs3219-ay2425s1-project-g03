import { User } from './user.model';

export interface BaseResponse {
    status: string;
    message: string;
}

export interface UServRes extends BaseResponse {
    message: string;
    data: User;
}
