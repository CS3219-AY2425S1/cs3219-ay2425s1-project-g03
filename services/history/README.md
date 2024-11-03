# History Service User Guide

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

### Retrieve History

- This endpoint retrieves the history of a user.
- **HTTP Method**: `GET`
- **Endpoint**: http://localhost:8086/api/history
- **Headers**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Required)
  - The endpoint requires the user to include a JWT (JSON Web Token) in the HTTP Request Header for authentication and authorization. This token is generated during the authentication process (i.e., login) and contains information about the user's identity. The server verifies this token to ensure that the client is authorized to access the data.
- **Responses**

    | Response Code               | Explanation                                      |
    |-----------------------------|--------------------------------------------------|
    | 200 (OK)                    | Success, user history returned                   |
    | 401 (Unauthorized)          | Access denied due to missing/invalid/expired JWT |
    | 500 (Internal Server Error) | Unexpected error in the database or server.      |

  ```json
    {
      "status": "Success",
      "message": "User history retrieved successfully",
      "data": [
        {
          "_id": "67234d29083151331116d910",
          "roomId": "67234d29aa52f2376973f96a",
          "user": {
            "username": "user123",
            "_id": "671a064a6f536e9af46b0017"
          },
          "collaborator": {
            "username": "userabc",
            "_id": "671a06526f536e9af46b001f"
          },
          "question": {
            "id": 1,
            "title": "Roman to Integer",
            "description": "Given a roman numeral, convert it to an integer.",
            "topics": [ "Algorithms" ],
            "difficulty": "Easy",
            "_id": "671a0615dc63fe2d5f3bbae5"
          },
          "status": "FORFEITED",
          "createdAt": "2024-10-31T09:26:01.743Z",
          "updatedAt": "2024-10-31T09:26:12.889Z"
        },
      ]
    }
  ```

---

## Consumers

### Create History Consumer

- This consumer creates the user history for the users upon the creation of a collaborative session.
- **Queue**: `CREATE_HISTORY` - This message is emitted when a collaboration room is created.
- **Data Consumed**
  - `roomId` - The ID of the collaboration room.
  - `user1` - The first user associated with the collaboration room.
  - `user2` - The second user associated with the collaboration room.
  - `question` - The question associated with the collaboration room.

  ```json
    {
      "roomId": "67234d29aa52f2376973f96a",
      "user1": {
        "username": "user123",
        "_id": "671a064a6f536e9af46b0017"
      },
      "user2": {
        "username": "userabc",
        "_id": "671a06526f536e9af46b001f"
      },
      "question": {
        "id": 1,
        "title": "Roman to Integer",
        "description": "Given a roman numeral, convert it to an integer.",
        "topics": [ "Algorithms" ],
        "difficulty": "Easy",
        "_id": "671a0615dc63fe2d5f3bbae5"
      },
    },
  ```

---

### Update History Consumer

- This consumer updates the user history for the users upon forfeiting or completing the collaborative session.
- **Queue**: `UPDATE_HISTORY` - This message is emitted when a user forfeits or completes a collaborative session.
- **Data Consumed**
  - `roomId` - The ID of the collaboration room.
  - `userId` - The user associated with the update.
  - `status` - The new status associated with the collaboration room. It may be `"IN_PROGRESS"`, `"FORFEITED"`, or `"COMPLETED"`.

  ```json
    {
      "roomId": "67234d29aa52f2376973f96a",
      "userId": "671a064a6f536e9af46b0017",
      "status": "FORFEITED"
    },
  ```