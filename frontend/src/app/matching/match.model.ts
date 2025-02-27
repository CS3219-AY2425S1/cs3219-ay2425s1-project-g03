import { Difficulty } from './user-criteria.model';

export interface MatchRequest {
    topics: string[];
    difficulty: Difficulty;
}

export enum MatchStatus {
    PENDING = 'PENDING',
    TIME_OUT = 'TIME_OUT',
    MATCH_FOUND = 'MATCH_FOUND',
    MATCH_FAILED = 'MATCH_FAILED',
    COLLAB_CREATED = 'COLLAB_CREATED',
}

export interface MatchRequestStatus {
    _id: string;
    userId: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    topics: string[];
    difficulty: Difficulty;
    status?: MatchStatus;
    pairId?: string;
    collabId?: string;
}

export interface BaseResponse {
    status: string;
    message: string;
}

export interface MatchResponse extends BaseResponse {
    data: MatchRequestStatus;
}
