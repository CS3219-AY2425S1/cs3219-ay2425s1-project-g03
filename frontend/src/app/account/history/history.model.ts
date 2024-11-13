import { DifficultyLevels } from '../../questions/difficulty-levels.enum';

export enum HistoryStatus {
    COMPLETED = 'COMPLETED',
    FORFEITED = 'FORFEITED',
    IN_PROGRESS = 'IN_PROGRESS',
}

export interface MatchingHistory {
    id: string;
    roomId: string;
    collaborator: string; // collaborator username
    question: Question; // question
    difficulty: DifficultyLevels; // question difficulty
    topics: string[]; // question topics
    status: HistoryStatus; // status of the session
    time: string | null; // time of the session
    language?: string; // language used during the session
    code?: string; // code written during the session
}

export interface User {
    username: string;
    _id: string;
}

export interface Question {
    id: number;
    title: string;
    description: string;
    topics: string[];
    difficulty: DifficultyLevels;
    _id: string;
}

export interface Snapshot {
    language: string;
    code: string;
}

export interface sessionHistory {
    _id: string;
    roomId: string;
    user: User;
    collaborator: User;
    question: Question;
    status: HistoryStatus;
    createdAt: string;
    updatedAt: string;
    snapshot?: Snapshot;
}

export interface historyResponse {
    status: HistoryStatus;
    message: string;
    data: sessionHistory[];
}
