import { Types } from 'mongoose';

export type IdType = string | Types.ObjectId;

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}
export interface Question {
    id: number;
    description: string;
    difficulty: Difficulty;
    title: string;
    topics?: string[];
}
export interface UserWithRequest {
    id: Types.ObjectId | string;
    username: string;
    email: string;
    requestId: Types.ObjectId | string;
}
export interface MatchFoundEvent {
    user1: UserWithRequest;
    user2: UserWithRequest;
    topics: string[];
    difficulty: Difficulty;
}

export interface QuestionFoundEvent {
    user1: UserWithRequest;
    user2: UserWithRequest;
    question: Question;
}

export interface MatchFailedEvent {
    requestId1: IdType;
    requestId2: IdType;
    reason: string;
}
