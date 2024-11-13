import { ObjectId } from 'mongodb';

/**
 * @fileoverview Types for the collaboration service.
 */

/**
 * User interface.
 */
export interface User {
    id: string;
    username: string;
    requestId: string;
    isForfeit?: boolean;
}

/**
 * Room interface.
 */
export interface Room {
    _id: ObjectId;
    users: User[];
    question: Question;
    createdAt: Date;
    room_status: boolean;
}

/**
 * Question difficulty enum.
 */
export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

/**
 * Question interface.
 */
export interface Question {
    id: number;
    description: string;
    difficulty: Difficulty;
    title: string;
    topics?: string[];
}
