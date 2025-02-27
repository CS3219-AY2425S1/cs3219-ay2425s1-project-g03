import { Types } from 'mongoose';
import { Difficulty } from '../models/matchRequestModel';

export interface UserWithRequest {
    id: Types.ObjectId | string;
    username: string;
    email: string;
    requestId: Types.ObjectId | string;
}

export interface MatchRequestUser {
    id: Types.ObjectId | string;
    username: string;
    requestId: Types.ObjectId | string;
}

export interface MatchUpdatedEvent {
    user: MatchRequestUser;
    topics: string[];
    difficulty: Difficulty;
}

export interface MatchFoundEvent {
    user1: UserWithRequest;
    user2: UserWithRequest;
    topics: string[];
    difficulty: Difficulty;
}

export interface CollabCreatedEvent {
    requestId1: Types.ObjectId | string;
    requestId2: Types.ObjectId | string;
    collabId: Types.ObjectId | string;
}

export interface MatchFailedEvent {
    requestId1: Types.ObjectId | string;
    requestId2: Types.ObjectId | string;
    reason: string;
}
