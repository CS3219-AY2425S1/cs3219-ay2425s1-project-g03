import { Types } from 'mongoose';
import { IdType, Question } from './event';

export enum HistoryStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    FORFEITED = 'FORFEITED',
    COMPLETED = 'COMPLETED',
}

export interface User {
    _id: Types.ObjectId | string;
    username: string;
}

export interface CreateHistoryMessage {
    roomId: IdType;
    user1: User;
    user2: User;
    question: Question;
}

export interface UpdateHistoryMessage {
    roomId: IdType;
    userId: IdType;
    status: HistoryStatus;
}
