# Question Service User Guide

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

## Endpoints

### Get Questions

This endpoint allows the retrieval of all the questions in the database. If filter by (optional) parameters, questions
that matches with parameters will be returned; if no parameters are provided, all questions will be returned.

- **HTTP Method**: `GET`
- **Endpoint**: `/questions`

#### Parameters:

- `title` (Optional) - Filter by question title.
- `description` (Optional) - Filter by question description.
- `topics` (Optional) - Filter by topics associated with the questions.
- `difficulty` (Optional) - Filter by question difficulty.

#### Responses:

| Response Code               | Explanation                                                                                                     |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------|
| 200 (OK)                    | Success, all questions are returned. If no questions match the optional parameters, an empty array is returned. |
| 500 (Internal Server Error) | Unexpected error in the database or server.                                                                     |

#### Command Line Example:

```
Retrieve all Questions:
curl -X GET http://localhost:8081/questions

Retrieve Questions by Title:
curl -X GET "http://localhost:8081/questions?title=Reverse%20a%20String"

Retrieve Questions by Description:
curl -X GET "http://localhost:8081/questions?description=string"

Retrieve Questions by Topics:
curl -X GET "http://localhost:8081/questions?topics=Algorithms,Data%20Structures"

Retrieve Questions by Difficulty:
curl -X GET "http://localhost:8081/questions?difficulty=Easy"

Retrieve Questions by Title and Difficulty:
curl -X GET "http://localhost:8081/questions?title=Reverse%20a%20String&difficulty=Easy"

Retrieve Questions by Title, Description, Topics, and Difficulty:
curl -X GET "http://localhost:8081/questions?title=Reverse%20a%20String&description=string&topics=Algorithms&difficulty=Easy"
```

#### Parameter Format Details:

The `topics` parameter must be passed as a comma-separated string in `GET` request because there is limitation with URL
encoding and readability concerns.

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Questions retrieved successfully",
  "data": [
    {
      "_id": "66ea6985cd34132719540c22",
      "id": 1,
      "description": "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\n\nExample 1:\n\nInput: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]\n\nExample 2:\nInput: s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]\nOutput: [\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]\n\nConstraints:\n1 \u003C= s.length \u003C= 105 s[i] is a printable ascii character.",
      "difficulty": "Easy",
      "title": "Reverse a String",
      "topics": [
        "Strings",
        "Algorithms"
      ]
    },
    {
      "_id": "66ea6985cd34132719540c23",
      "id": 2,
      "description": "Implement a function to detect if a linked list contains a cycle.",
      "difficulty": "Easy",
      "title": "Linked List Cycle Detection",
      "topics": [
        "Data Structures",
        "Algorithms"
      ]
    }
  ]
}
```

---

### Get Question by ID

This endpoint allows the retrieval of the question by using the question ID.

- **HTTP Method**: `GET`
- **Endpoint**: `/questions/{id}`

#### Parameters:

- `id` (Required) - The ID of the question to retrieve.

#### Responses:

| Response Code               | Explanation                                              |
|-----------------------------|----------------------------------------------------------|
| 200 (OK)                    | Success, question corresponding to the `id` is returned. |
| 404 (Not Found)             | Question with the specified `id` not found.              |
| 500 (Internal Server Error) | Unexpected error in the database or server.              |

#### Command Line Example:

```
Retrieve Question by ID:
curl -X GET http://localhost:8081/questions/1
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question with ID retrieved successfully",
  "data": {
    "_id": "66ea6985cd34132719540c22",
    "id": 1,
    "description": "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\n\nExample 1:\n\nInput: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]\n\nExample 2:\nInput: s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]\nOutput: [\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]\n\nConstraints:\n1 \u003C= s.length \u003C= 105 s[i] is a printable ascii character.",
    "difficulty": "Easy",
    "title": "Reverse a String",
    "topics": [
      "Strings",
      "Algorithms"
    ]
  }
}
```

---

### Get Question by Parameters (Random)

This endpoint allows the retrieval of random questions that matches the parameters provided.

- **HTTP Method**: `GET`
- **Endpoint**: `/questions/search`

#### Parameters:

- `limit` (Optional) - The number of questions to be returned. If not provided, default limit is 1.
- `topics` (Required) - The topic of the question.
- `difficulty` (Required) - The difficulty of the question.

#### Responses:

#### Responses:

| Response Code               | Explanation                                                                                                 |
|-----------------------------|-------------------------------------------------------------------------------------------------------------|
| 200 (OK)                    | Success, questions matching the parameters are returned. If no questions match, an empty array is returned. |
| 400 (Bad Request)           | The request is missing required parameters or the parameters are invalid.                                   |
| 500 (Internal Server Error) | Unexpected error in the database or server.                                                                 |

#### Command Line Example:

```
Retrieve Random Question by Topics and Difficulty:
curl -X GET "http://localhost:8081/questions/search?topics=Algorithms&difficulty=Medium"

Retrieve Random Question by Topics, Difficulty, and Limit:
curl -X GET "http://localhost:8081/questions/search?topics=Algorithms,Data%20Structures&difficulty=Easy&limit=5"
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Questions with Parameters retrieved successfully",
  "data": [
    {
      "_id": "66ea6985cd34132719540c25",
      "id": 4,
      "description": "Given two binary strings a and b, return their sum as a binary string.",
      "difficulty": "Easy",
      "title": "Add Binary",
      "topics": [
        "Bit Manipulation",
        "Algorithms"
      ]
    },
    {
      "_id": "66ea6985cd34132719540c22",
      "id": 1,
      "description": "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\n\nExample 1:\n\nInput: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]\n\nExample 2:\nInput: s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]\nOutput: [\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]\n\nConstraints:\n1 \u003C= s.length \u003C= 105 s[i] is a printable ascii character.",
      "difficulty": "Easy",
      "title": "Reverse a String",
      "topics": [
        "Strings",
        "Algorithms"
      ]
    },
    {
      "_id": "66ea6985cd34132719540c27",
      "id": 6,
      "description": "Implement a last-in first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
      "difficulty": "Easy",
      "title": "Implement Stack using Queues",
      "topics": [
        "Data Structures"
      ]
    }
  ]
}
```

---

### Get Topics

This endpoint retrieves all unique topics in the database

- **HTTP Method**: `GET`
- **Endpoint**: `/questions/topics`

#### Responses:

| Response Code               | Explanation                                                         |
|-----------------------------|---------------------------------------------------------------------|
| 200 (OK)                    | Success, all topics are returned.                                   |
| 500 (Internal Server Error) | The server encountered an error and could not complete the request. |

#### Command Line Example:

```
Retrieve Topics:
curl -X GET http://localhost:8081/questions/topics
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Topics retrieved successfully",
  "data": [
    "Algorithms",
    "Arrays",
    "Bit Manipulation",
    "Brainteaser",
    "Data Structures",
    "Databases",
    "Recursion",
    "Strings"
  ]
}
```

---

### Add Question

This endpoint allows the addition of a new question. The `id` is now automatically generated by the system to ensure
uniqueness.

- **HTTP Method**: `POST`
- **Endpoint**: `/questions`

#### Request Body:

- `title` (Required) - The title of the question.
- `description` (Required) - A description of the question.
- `topics` (Required) - The topics associated with the question.
- `difficulty` (Required) - The difficulty level of the question.

#### Responses:

| Response Code               | Explanation                                                         |
|-----------------------------|---------------------------------------------------------------------|
| 201 (Created)               | The question is created successfully.                               |
| 400 (Bad Request)           | Required fields are missing or invalid, or question already exists. |
| 500 (Internal Server Error) | Unexpected error in the database or server.                         |

#### Command Line Example:

```
Add Question:
curl -X POST http://localhost:8081/questions -H "Content-Type: application/json" -d "{\"title\": \"New Question\", \"description\": \"This is a description for a new question.\", \"topics\": [\"Data Structures\", \"Algorithms\"], \"difficulty\": \"Medium\"}"
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question created successfully",
  "data": {
    "id": 21,
    "title": "New Question",
    "description": "This is a description for a new question.",
    "topics": ["Data Structures", "Algorithms"],
    "difficulty": "Medium",
    "_id": "66f77e7bf9530832bd839239"
  }
}
```

---

### Update Question

This endpoint allows updating an existing question. Only the title, description, topics, and difficulty can be updated.

- **HTTP Method**: `PUT`
- **Endpoint**: `/questions/{id}`

#### Request Parameters:

- `id` (Required) - The ID of the question to update.

#### Request Body:

- `title` (Optional) - New title for the question.
- `description` (Optional) - New description for the question.
- `topics` (Optional) - New topics for the question.
- `difficulty` (Optional) - New difficulty level for the question.

#### Responses:

| Response Code               | Explanation                                                                        |
|-----------------------------|------------------------------------------------------------------------------------|
| 200 (OK)                    | Success, the question is updated successfully.                                     |
| 400 (Bad Request)           | Invalid request body such as including `id` or duplicate `title` or `description`. |
| 404 (Not Found)             | Question with the specified `id` not found.                                        |
| 500 (Internal Server Error) | Unexpected error in the database or server.                                        |

#### Command Line Example:

```
Update Question:
curl -X PUT http://localhost:8081/questions/21 -H "Content-Type: application/json" -d "{\"title\": \"Updated Question Title\", \"description\": \"This is the updated description.\", \"topics\": [\"Updated Topic\"], \"difficulty\": \"Hard\"}"
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question updated successfully",
  "data": {
    "_id": "66f77e7bf9530832bd839239",
    "id": 21,
    "title": "Updated Question Title",
    "description": "This is the updated description.",
    "topics": ["Updated Topic"],
    "difficulty": "Hard"
  }
}
```

---

### Delete Question

This endpoint allows the deletion of a question by the question ID.

- **HTTP Method**: `DELETE`
- **Endpoint**: `/questions/{id}`

#### Parameters:

- `id` (Required) - The ID of the question to delete.

#### Responses:

| Response Code               | Explanation                                    |
|-----------------------------|------------------------------------------------|
| 200 (OK)                    | Success, the question is deleted successfully. |
| 404 (Not Found)             | Question with the specified `id` not found.    |
| 500 (Internal Server Error) | Unexpected error in the database or server.    |

#### Command Line Example:

```
Delete Question:
curl -X DELETE http://localhost:8081/questions/21
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question deleted successfully",
  "data": {
    "_id": "66f77e7bf9530832bd839239",
    "id": 21,
    "title": "Duplicate Title",
    "description": "This is the updated description.",
    "topics": ["Updated Topic"],
    "difficulty": "Hard"
  }
}
```

---

### Delete Questions

This endpoint allows the deletion of multiple questions by their question IDs.

- **HTTP Method**: `POST`
- **Endpoint**: `/questions/delete`

#### Parameters:

- `ids` (Required) - An array of integers representing the IDs of the questions to delete, e.g. `[1, 2, 3]`.

#### Responses:

| Response Code               | Explanation                                          |
|-----------------------------|------------------------------------------------------|
| 200 (OK)                    | Success, the question is deleted successfully.       |
| 400 (Bad Request)           | The `ids` parameter was not specified or is invalid. |
| 404 (Not Found)             | A question with the specified id not found.          |
| 500 (Internal Server Error) | Unexpected error in the database or server.          |

#### Command Line Example:

```
Delete Questions:
curl -X POST http://localhost:8081/questions/delete -H "Content-Type: application/json" -d '{"ids": [21, 22]}'
```

#### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Questions deleted successfully",
  "data": null
}
```

---

## Producers

### Question Found Producer

- This producer emits a message when a question has been successfully found for a match.
- **Queue**: `QUESTION_FOUND`
- **Data Produced**
  - `user1` - The first user associated with the successful match.
  - `user2` - The second user associated with the successful match.
  - `question` - The question assigned to the successful match.

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
      "question": {
        "_id": "66f77e7bf9530832bd839239",
        "id": 21,
        "title": "Reverse Integer",
        "description": "Given a signed 32-bit integer x, return x with its digits reversed.",
        "topics": ["Math"],
        "difficulty": "Medium"
      }
    }
  ```

---

### Match Failed Producer

- This producer emits a message when a question could not be found for a match.
- **Queue**: `MATCH_FAILED`
- **Data Produced**
  - `requestId1` - The first request ID associated with the match failure.
  - `requestId2` - The second request ID associated with the match failure.
  - `reason` - The error encountered.

  ```json
    {
      "requestId1": "6714d1806da8e6d033ac2be1",
      "requestId2": "67144180cda8e610333e4b12",
      "reason": "No questions were found",
    }
  ```

---

## Consumers

### Match Found Consumer

- This consumer attempts to find and assign a compatible question.
- Upon successfully finding a question, it produces a `QUESTION_FOUND` message.
- **Queue**: `MATCH_FOUND` - This message is emitted when a match is found between two match requests.s
- **Data Consumed**
  - `user1` - The first user associated with the match request.
  - `user2` - The second user associated with the match request.
  - `topics` - The topics in common between the two requests.
  - `difficulty` - The difficulty of the match request.

  ```json
    {
      "user1": {
        "id": "6713d1778986bf54b29bd0f8",
        "username": "user123",
        "requestId": "6714d1806da8e6d033ac2be1",
      },
      "user2": {
        "id": "6714d1806da8e6d033ac2be1",
        "username": "userabc",
        "requestId": "6713d1778986bf54b29bd0f8",
      },
      "topics": [ "Algorithms", "Arrays" ],
      "difficulty": "Hard"
    }
    ```
