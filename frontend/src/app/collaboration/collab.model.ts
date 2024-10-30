import { Question } from '../questions/question.model';

export interface RoomResponse {
    status: string;
    data: RoomData;
}

export interface CloseRoomResponse {
    status: string;
    data: string;
}

export interface RoomsResponse {
    status: string;
    data: string[];
}

export interface CollabUser {
    id: string;
    username: string;
    requestId: string;
    isForfeit: boolean;
}

interface RoomData {
    room_id: string;
    users: CollabUser[];
    question: Question;
    createdAt: string;
    room_status: boolean;
}

export interface awarenessData {
    user: {
        userId: string;
        name: string;
        color: string;
        colorLight: string;
    };
}
