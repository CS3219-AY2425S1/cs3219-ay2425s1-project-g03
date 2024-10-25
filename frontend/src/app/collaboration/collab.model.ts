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

interface User {
    id: string;
    username: string;
    requestId: string;
}

interface RoomData {
    room_id: string;
    users: User[];
    question_id: number;
    createdAt: string;
    room_status: boolean;
}
