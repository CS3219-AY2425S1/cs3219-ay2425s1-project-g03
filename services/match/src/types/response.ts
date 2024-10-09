import { MatchRequest, MatchRequestStatus } from '../models/matchRequestModel';
import { RequestUser } from './request';

export interface BaseResponse {
    status: string;
    message: string;
}

export interface VerifyTokenResponse extends BaseResponse {
    data: RequestUser;
}

export interface MatchRequestWithStatus extends MatchRequest {
    status: MatchRequestStatus;
}
