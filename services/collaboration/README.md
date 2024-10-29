# Collaboration Service User Guide

## Pre-requisites

1. Run the following command to create the `.env` files at the root directory:

```cmd
cp .env.sample .env
```

2. After setting up the .env files, build the Docker images and start the containers using the following command:

```cmd
docker compose build
docker compose up -d
```

3. To stop and remove the containers and associated volumes, use the following command:

```cmd
docker compose down -v
```

---

## Overview

The `Collaboration Service` manages the lifecycle of collaboration sessions, including room creation, retrieval, and
closure. When
a room is created, it is assigned to two users, a Yjs document is initialized for real-time collaboration, and the
room’s status is set to `open`. Rooms are used to group users working together on a shared task, such as collaborative
coding, and are identified by a unique `room_id`. The room’s status can be updated to `closed` when users leave
or forfeit the session, which also removes the Yjs document and its data from MongoDB to free resources.

### Useful Links

- [Yjs](https://github.com/yjs/yjs) to sync document states between clients.
- [y-websocket](https://github.com/yjs/y-websocket) as the WebSocket provider.
- [y-mongodb-provider](https://github.com/MaxNoetzold/y-mongodb-provider) using MongoDB to provide data persistence.

### Key Features

- `Real-time Collaboration`: Synchronize changes between clients in real-time using Yjs, ensuring that users always have
  the latest document state.
- `Room Management`: Handle the creation, retrieval, and closure of rooms, allowing two users to work together in a
  shared environment.
- `Room Status Tracking`: Rooms are automatically created with an `open` status and can be `closed` when users leave,
  ensuring active collaboration sessions are properly managed.
- `WebSocket-based Communication`: Uses WebSocket connections to handle real-time synchronization of Yjs documents
  between users.
- `MongoDB Persistence`: Yjs document updates and room data are persisted in MongoDB, ensuring fault tolerance and the
  ability to resume sessions after interruptions.
- `Automatic Cleanup`: When a room is closed, the corresponding Yjs document is removed from MongoDB, ensuring efficient
  use of resources.

---

## Environment Variables

Here are the key environment variables used in the `.env` file:

| Variable                 | Description                                                                           |
|--------------------------|---------------------------------------------------------------------------------------|
| `COLLAB_CLOUD_MONGO_URI` | URI for connecting to the MongoDB Atlas database for the collaboration service (room) |
| `COLLAB_LOCAL_MONGO_URI` | URI for connecting to the local MongoDB database for the collaboration service (room) |
| `YJS_CLOUD_MONGO_URI`    | URI for connecting to the MongoDB Atlas database for Yjs document persistence         |
| `YJS_LOCAL_MONGO_URI`    | URI for connecting to the local MongoDB database for Yjs document persistence         |
| `DB_USERNAME`            | Username for the MongoDB databases (for both cloud and local environments)            |
| `DB_PASSWORD`            | Password for the MongoDB databases (for both cloud and local environments)            |
| `QUESTION_SERVICE_URL`   | URL for connecting to the Question Service API                                        |
| `CORS_ORIGIN`            | Allowed origins for CORS (default: * to allow all origins)                            |
| `PORT`                   | Port for the Room and Collaboration Service (default: 8084)                           |
| `ENV`                    | Environment setting (`development` or `production`)                                   |

---

## Documentation on API Endpoints

The `Collaboration Service` provides HTTP API endpoints to manage and retrieve details about rooms used in the real-time
collaboration service. It enables creating rooms, retrieving room details, and managing room statuses.

---

## Get Room IDs by User ID

This endpoint retrieves all room IDs for a given user, but only if the room is still active (`room_status` is `true`).
One user can have multiple rooms, and each room is identified by a unique `room_id`.

- **HTTP Method**: `GET`
- **Endpoint**: `/room/user/{userId}`

### Parameters:

- `userId` (Required) - The ID of the user whose room IDs are to be retrieved.

### Responses:

| Response Code               | Explanation                                 |
|-----------------------------|---------------------------------------------|
| 200 (OK)                    | Success, room IDs retrieved.                |
| 404 (Not Found)             | No rooms found for the user.                |
| 500 (Internal Server Error) | Unexpected error in the server or database. |

### Command Line Example:

```bash
Retrieve Room IDs by User ID: curl -X GET http://localhost:8087/room/user/6718b0070e24954ac125e5e1
```

### Example of Response Body for Success:

```json
{
  "status": "Success",
  "data": [
    "6718b027b4624a70311bc0ed",
    "6718b058b4624a70311bc0ee"
  ]
}
```

---

## Get Room by Room ID

This endpoint retrieves the details of a room by its room ID.

- **HTTP Method**: `GET`
- **Endpoint**: `/room/{roomId}`

### Parameters:

- `roomId` (Required) - The ID of the room to retrieve.

### Responses:

| Response Code               | Explanation                                 |
|-----------------------------|---------------------------------------------|
| 200 (OK)                    | Success, room details returned.             |
| 404 (Not Found)             | Room not found.                             |
| 500 (Internal Server Error) | Unexpected error in the server or database. |

### Command Line Example:

```bash
Retrieve Room by Room ID: curl -X GET http://localhost:8087/room/6718b027b4624a70311bc0ed
```

### Example of Response Body for Success:

```json
{
  "status": "Success",
  "data": {
    "room_id": "6718b027b4624a70311bc0ed",
    "users": [
      {
        "id": "6718b0050e24954ac125e5dd",
        "username": "Testing",
        "requestId": "6718b027a8144e99bbee17ce",
        "isForfeit": false
      },
      {
        "id": "6718b0070e24954ac125e5e1",
        "username": "Testing1",
        "requestId": "6718b026a8144e99bbee17c8",
        "isForfeit": false
      }
    ],
    "question_id": 2,
    "createdAt": "2024-10-23T08:13:27.886Z",
    "room_status": true
  }
}
```

---

## Update User Forfeit Status in Room

This endpoint updates the `isForfeit` status of a specified user in a particular room. Each user in a room has
a
`isForfeit` field that tracks whether the user has left the room through forfeiting or is still active.

- **HTTP Method**: `PATCH`
- **Endpoint**: `/room/roomToEdit/{roomId}/user/{userId}/isForfeit`

### Parameters:

- `roomId` (Required) - The ID of the room to update.
- `userId` (Required) - The ID of the user to update.

### Responses:

| Response Code               | Explanation                                   |
|-----------------------------|-----------------------------------------------|
| 200 (OK)                    | Success, user status updated successfully.    |
| 404 (Not Found)             | Room or user not found in the specified room. |
| 400 (Bad Request)           | Invalid or missing `statusExist` parameter.   |
| 500 (Internal Server Error) | Unexpected error in the server or database.   |

### Command Line Example:

```bash
Update User Status: curl -X PATCH http://localhost:8087/room/roomToEdit/6718b027b4624a70311bc0ed/user/6718b0070e24954ac125e5e1/isForfeit -H "Content-Type: application/json" -d '{"isForfeit": true}'
```

```json
{
  "status": "Success",
  "data": {
    "message": "User status updated successfully",
    "room": {
      "room_id": "6718b027b4624a70311bc0ed",
      "users": [
        {
          "id": "6718b0050e24954ac125e5dd",
          "username": "Testing",
          "requestId": "6718b027a8144e99bbee17ce",
          "isForfeit": false
        },
        {
          "id": "6718b0070e24954ac125e5e1",
          "username": "Testing1",
          "requestId": "6718b026a8144e99bbee17c8",
          "isForfeit": true
        }
      ],
      "question_id": 2,
      "createdAt": "2024-10-23T08:13:27.886Z",
      "room_status": true
    }
  }
}
```

---

## Close Room

This endpoint allows a user to close a room (change `room_status` to `false`) and delete the associated Yjs document.

- **HTTP Method**: `PATCH`
- **Endpoint**: `/room/{roomId}/close`

### Parameters:

- `roomId` (Required) - The ID of the room to close.

### Responses:

| Response Code               | Explanation                                                                |
|-----------------------------|----------------------------------------------------------------------------|
| 200 (OK)                    | Success, room closed and Yjs document removed, or room was already closed. |
| 404 (Not Found)             | Room not found.                                                            |
| 500 (Internal Server Error) | Unexpected error in the server or database.                                |

### Command Line Example:

```bash
Close Room: curl -X PATCH http://localhost:8087/room/6718b027b4624a70311bc0ed/close
```

### Example of Response Body for Success:

```json
{
  "status": "Success",
  "data": "Room 6718b027b4624a70311bc0ed successfully closed"
}
```

---

## Documentation on Queue (RabbitMQ)

The collaboration service uses RabbitMQ as a message broker to facilitate communication between microservices (such as
the `matching service` and `collaboration service`) in an asynchronous manner. The system consists of a consumer and a
producer:

### Queues Used

- `MATCH_FOUND`: Handles messages related to matching users and creating collaboration rooms.
- `COLLAB_CREATED`: Sends messages indicating that a collaboration room has been successfully created.

---

## Producer

The producer will send a message to the `COLLAB_CREATED` queue when a collaboration room is successfully created.

- **Queue**: `COLLAB_CREATED`
- **Data in the Message**:
    - `requestId1` (Required) - The request ID of the first user.
    - `requestId2` (Required) - The request ID of the second user.
    - `collabId` (Required) - The ID of the collaboration room.

```json
{
  "requestId1": "user1-request-id",
  "requestId2": "user2-request-id",
  "collabId": "generated-room-id"
}
```

---

## Consumer

The consumer will listen for messages on the `MATCH_FOUND` queue and create a collaboration room when two users are
matched.

- **Queue**: `MATCH_FOUND`
- **Data in the Message**:
    - `user1` (Required) - The details of the first user.
    - `user2` (Required) - The details of the second user.
    - `topics` (Required) - The topics selected by the users.
    - `difficulty` (Required) - The difficulty level selected by the users.

```json
{
  "user1": {
    "id": "user1-id",
    "username": "user1-username",
    "requestId": "user1-request-id"
  },
  "user2": {
    "id": "user2-id",
    "username": "user2-username",
    "requestId": "user2-request-id"
  },
  "topics": [
    "topic1",
    "topic2"
  ],
  "difficulty": "Medium"
}
```

---