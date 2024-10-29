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
    _id: string;
    users: User[];
    question_id: number;
    createdAt: Date;
    room_status: boolean;
}
