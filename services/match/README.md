# Match Service User Guide

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

## Endpoints

### Create Match Request

- This endpoint creates a new match request. The match request will remain valid for 1 minute.
- **HTTP Method**: `POST`
- **Endpoint**: http://localhost:8083/match/request
- **Body**
  - `topics` (Required) - The topics associated with the match request.
  - `difficulty` (Required) - The difficulty level of the match request.

    ```json
    {
      "topics[]": "Algorithms",
      "topics[]": "Arrays",
      "difficulty": "Hard"
    }
    ```
- **Headers**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Required)
  - The endpoint requires the user to include a JWT (JSON Web Token) in the HTTP Request Header for authentication and authorization. This token is generated during the authentication process (i.e., login) and contains information about the user's identity. The server verifies this token to ensure that the client is authorized to access the data.
- **Responses**

    | Response Code               | Explanation                                 |
    |-----------------------------|---------------------------------------------|
    | 201 (Created)               | The match request is created successfully.  |
    | 400 (Bad Request)           | Required fields are missing or invalid.     |
    | 500 (Internal Server Error) | Unexpected error in the database or server. |

  ```json
    {
      "status": "Success",
      "message": "Match request created successfully",
      "data": {
        "userId": "6713d1778986bf54b29bd0f8",
        "username": "user123",
        "topics": [
            "Algorithms",
            "Arrays"
        ],
        "difficulty": "Hard",
        "_id": "6714d1806da8e6d033ac2be1",
        "createdAt": "2024-10-20T09:46:40.877Z",
        "updatedAt": "2024-10-20T09:46:40.877Z"
      }
    }
  ```

---

### Delete Match Request

- This endpoint deletes the match request.
- **HTTP Method**: `DELETE`
- **Endpoint**: http://localhost:8083/match/request/{requestId}
- **Parameters**
  -  `requestId` (Required) - The request ID of the match request.
  - Example: `http://localhost:8083/match/request/6706b5d706ecde0138ca27a9`
- **Headers**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Required)
  - The endpoint requires the user to include a JWT (JSON Web Token) in the HTTP Request Header for authentication and authorization. This token is generated during the authentication process (i.e., login) and contains information about the user's identity. The server verifies this token to ensure that the client is authorized to access the data.
- **Responses**

    | Response Code               | Explanation                                                     |
    |-----------------------------|-----------------------------------------------------------------|
    | 200 (OK)                    | The match request is updated successfully.                      |
    | 404 (Not Found)             | The match request with the specified `requestId` was not found. |
    | 500 (Internal Server Error) | Unexpected error in the database or server.                     |

  ```json
    {
      "status": "Success",
      "message": "Match request deleted successfully",
      "data": {
        "userId": "6713d1778986bf54b29bd0f8",
        "username": "user123",
        "topics": [
            "Algorithms",
            "Arrays"
        ],
        "difficulty": "Hard",
        "_id": "6714d1806da8e6d033ac2be1",
        "createdAt": "2024-10-20T09:46:40.877Z",
        "updatedAt": "2024-10-20T09:49:57.332Z"
      }
    }
  ```

---

### Retrieve Match Request

- This endpoint retrieves the match request and its status.
- **HTTP Method**: `GET`
- **Endpoint**: http://localhost:8083/match/request/{requestId}
- **Parameters**
  -  `requestId` (Required) - The request ID of the match request.
  - Example: `http://localhost:8083/match/request/6706b5d706ecde0138ca27a9`
- **Headers**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Required)
  - The endpoint requires the user to include a JWT (JSON Web Token) in the HTTP Request Header for authentication and authorization. This token is generated during the authentication process (i.e., login) and contains information about the user's identity. The server verifies this token to ensure that the client is authorized to access the data.
- **Responses**
  - `pairId` - The request ID of  the matched user. This field is only present with a status of `MATCH_FOUND` or `COLLAB_CREATED`.
  - `collabId` - The ID of the collaboration room. This field is only present with a status of `COLLAB_CREATED`.

    | Response Code               | Explanation                                                     |
    |-----------------------------|-----------------------------------------------------------------|
    | 200 (OK)                    | The match request is updated successfully.                      |
    | 404 (Not Found)             | The match request with the specified `requestId` was not found. |
    | 500 (Internal Server Error) | Unexpected error in the database or server.                     |

    | Response Status | Explanation                                                                    |
    |-----------------|--------------------------------------------------------------------------------|
    | PENDING         | Searching for a match.                                                         |
    | TIME_OUT        | Search time ended, and no match was found.                                     |
    | MATCH_FOUND     | A match has been found and is awaiting the creation of the collaboration room. |
    | COLLAB_CREATED  | The collaboration room is now accessible with the provided `collabId`.         |

  ```json
    {
      "status": "Success",
      "message": "Match request retrieved successfully",
      "data": {
          "_id": "6714d1806da8e6d033ac2be1",
          "userId": "6713d1778986bf54b29bd0f8",
          "username": "user123",
          "topics": [
              "Algorithms",
              "Arrays"
          ],
          "difficulty": "Hard",
          "createdAt": "2024-10-20T09:46:40.877Z",
          "updatedAt": "2024-10-20T09:49:57.332Z",
          "status": "PENDING"
      }
    }
  ```

  ```json
    {
      "status": "Success",
      "message": "Match request retrieved successfully",
      "data": {
          "_id": "6714d1806da8e6d033ac2be1",
          "userId": "6713d1778986bf54b29bd0f8",
          "username": "user123",
          "topics": [
              "Algorithms",
              "Arrays"
          ],
          "difficulty": "Hard",
          "createdAt": "2024-10-20T09:46:40.877Z",
          "updatedAt": "2024-10-20T09:49:57.332Z",
          "status": "TIME_OUT"
      }
    }
  ```

  ```json
    {
      "status": "Success",
      "message": "Match request retrieved successfully",
      "data": {
          "_id": "6714d1806da8e6d033ac2be1",
          "userId": "6713d1778986bf54b29bd0f8",
          "username": "user123",
          "topics": [
              "Algorithms",
              "Arrays"
          ],
          "difficulty": "Hard",
          "createdAt": "2024-10-20T09:46:40.877Z",
          "updatedAt": "2024-10-20T09:49:57.332Z",
          "pairId": "6714d49a028e8780b3a73a55",
          "status": "MATCH_FOUND"
      }
    }
  ```

  ```json
    {
      "status": "Success",
      "message": "Match request retrieved successfully",
      "data": {
          "_id": "6714d1806da8e6d033ac2be1",
          "userId": "6713d1778986bf54b29bd0f8",
          "username": "user123",
          "topics": [
              "Algorithms",
              "Arrays"
          ],
          "difficulty": "Hard",
          "createdAt": "2024-10-20T09:46:40.877Z",
          "updatedAt": "2024-10-20T09:49:57.332Z",
          "pairId": "676e7c9a028e8780b3a73a58",
          "status": "COLLAB_CREATED"
      }
    }
  ```

---

## Producers

### Match Request Updated Producer

- This producer emits a message when a match request has been created or updated. 
- **Queue**: `MATCH_REQUEST_UPDATED`
- **Data Produced**
  - `user` - The user associated with the created or updated match request.
  - `topics` - The topics of the created or updated match request.
  - `difficulty` - The difficulty of the created or updated match request.

  ```json
    {
      "user": {
        "id": "6713d1778986bf54b29bd0f8",
        "username": "user123",
        "requestId": "6714d1806da8e6d033ac2be1",
      },
      "topics": [ "Algorithms", "Arrays" ],
      "difficulty": "Hard"
    }
    ```

---

### Match Found Producer

- This producer emits a message when a match has been successfully found between two users based on their preferences. 
- **Queue**: `MATCH_FOUND`
- **Data Produced**
  - `user1` - The first user associated with the successful match.
  - `user2` - The second user associated with the successful match.
  - `topics` - The common topics associated with the successful match.
  - `difficulty` - The difficulty associated with the successful match.

  ```json
    {
      "user1": {
        "id": "6713d1778986bf54b29bd0f8",
        "username": "user123",
        "requestId": "6714d1806da8e6d033ac2be1",
      },
      "user2": {
        "id": "6713d17f8986bf54b29bd0fe",
        "username": "userabc",
        "requestId": "6714dab233a91c7f7c9b9b15",
      },
      "topics": [ "Algorithms" ],
      "difficulty": "Hard"
    }
    ```

---

## Consumers

### Match Request Updated Consumer

- This consumer attempts to find and assign a compatible match request based on their preferences (topics and difficulty) upon the update of a given match request.
- Two match requests are said to be compatible if they share the same difficulty and have at least one topic in common.
- Upon successfully finding a match, it produces a `MATCH_FOUND` event.
- **Queue**: `MATCH_REQUEST_UPDATED` - This message is emitted when a match request is created or updated.
- **Data Consumed**
  - `user` - The user associated with the created or updated match request.
  - `topics` - The topics of the created or updated match request.
  - `difficulty` - The difficulty of the created or updated match request.

  ```json
    {
      "user": {
        "id": "6713d1778986bf54b29bd0f8",
        "username": "user123",
        "requestId": "6714d1806da8e6d033ac2be1",
      },
      "topics": [ "Algorithms", "Arrays" ],
      "difficulty": "Hard"
    }
    ```

---

### Collab Created Consumer

- This consumer assigns the relevant collaboration IDs to the corresponding match requests upon the creation of the collaboration room.
- **Queue**: `COLLAB_CREATED` - This message is emitted when a collaboration room is created.
- **Data Consumed**
  - `requestId1` - The first request ID associated with the collaboration room.
  - `requestId2` - The second request ID associated with the collaboration room.
  - `collabId` - The collaboration ID associated with the collaboration room.

  ```json
    {
      "requestId1": "6714d1806da8e6d033ac2be1",
      "requestId2": "67144180cda8e610333e4b12",
      "collabId": "676e7c9a028e8780b3a73a58",
    }
    ```

---

### Match Failed Consumer

- This consumer marks the match as failed.
- **Queue**: `MATCH_FAILED` - This message is emitted when a match fails due to unexpected errors.
- **Data Consumed**
  - `requestId1` - The first request ID associated with the match failure.
  - `requestId2` - The second request ID associated with the match failure.
  - `reason` - The error encountered.

  ```json
    {
      "requestId1": "6714d1806da8e6d033ac2be1",
      "requestId2": "67144180cda8e610333e4b12",
      "reason": "Failed to create room",
    }
    ```