import { HistoryStatus, IdType, Question, User } from '../models/historyModel';

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
