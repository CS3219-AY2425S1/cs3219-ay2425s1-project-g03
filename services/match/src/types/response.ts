import { RequestUser } from '../models/request';

export interface BaseResponse {
    status: string;
    message: string;
}

export interface VerifyTokenResponse extends BaseResponse {
    data: RequestUser;
}
