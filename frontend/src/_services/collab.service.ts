import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { RoomResponse, CloseRoomResponse, RoomsResponse } from '../app/collaboration/collab.model';

@Injectable({
    providedIn: 'root',
})
export class CollabService extends ApiService {
    protected apiPath = 'collaboration/room';

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    constructor(private http: HttpClient) {
        super();
    }

    getRoomsWithQuery(isActive: boolean, isForfeit: boolean) {
        const params = new URLSearchParams({
            roomStatus: isActive.toString(),
            isForfeit: isForfeit.toString(),
        }).toString();

        return this.http.get<RoomsResponse>(`${this.apiUrl}/?${params}`);
    }

    /**
     * Retrieves all room IDs for a given user, but only if the room is still
     * active (room_status is true). One user can have multiple rooms,
     * and each room is identified by a unique room_id.
     */
    getRooms() {
        return this.http.get<RoomsResponse>(this.apiUrl + '/user/rooms');
    }

    /**
     * Retrieves the details of a room by its room ID.
     */
    getRoomDetails(roomId: string) {
        return this.http.get<RoomResponse>(this.apiUrl + '/' + roomId);
    }

    /**
     * Allows a user to close a room (change room_status to false) and delete the associated Yjs document.
     */
    closeRoom(roomId: string, language: string, code: string) {
        return this.http.patch<CloseRoomResponse>(
            this.apiUrl + '/' + roomId + '/close',
            {
                snapshot: {
                    language: language,
                    code: code,
                },
            },
            this.httpOptions,
        );
    }

    /**
     * updates the isForfeit status of a specified user in a particular room. Each user in a room has a
     * isForfeit field that tracks whether the user has left the room through forfeiting or is still active.
     */
    forfeit(roomId: string, language: string, code: string) {
        return this.http.patch<RoomResponse>(
            this.apiUrl + '/' + roomId + '/user/isForfeit',
            {
                isForfeit: true,
                snapshot: {
                    language: language,
                    code: code,
                },
            },
            this.httpOptions,
        );
    }
}
