import { ObjectId } from 'mongodb';
import { Question } from './roomController';

/**
 * @fileoverview Types for the collaboration service.
 */

export interface User {
    id: string;
    username: string;
    requestId: string;
    isForfeit?: boolean;
}

export interface Room {
    _id: ObjectId;
    users: User[];
    question: Question;
    createdAt: Date;
    room_status: boolean;
}
