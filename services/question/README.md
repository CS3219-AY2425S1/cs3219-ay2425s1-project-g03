# Question Service User Guide

## Get Questions

This endpoint allows the retrieval of all the questions in the database. If filter by (optional) parameters, questions
that matches with parameters will be returned; if no parameters are provided, all questions will be returned.

- **HTTP Method**: `GET`
- **Endpoint**: `/questions`

### Parameters:

- `title` (Optional) - Filter by question title.
- `description` (Optional) - Filter by question description.
- `topics` (Optional) - Filter by topics associated with the questions.
- `difficulty` (Optional) - Filter by question difficulty.

### Responses:

| Response Code               | Explanation                                |
|-----------------------------|--------------------------------------------|
| 200 (OK)                    | Success, all questions are returned        |
| 404 (Not Found)             | No questions found.                        |
| 500 (Internal Server Error) | Unexpected error in the database or server |

### Command Line Example:

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

### Example of Response Body for Success:

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

## Get Question by ID

This endpoint allows the retrieval of the question by using the question ID.

- **HTTP Method**: `GET`
- **Endpoint**: `/questions/{questionId}`

### Parameters:

- `questionId` (Required) - The ID of the question to retrieve.

### Responses:

| Response Code               | Explanation                                                     |
|-----------------------------|-----------------------------------------------------------------|
| 200 (OK)                    | Success, question corresponding to the `questionID` is returned |
| 404 (Not Found)             | Question with the specified `questionID` not found              |
| 500 (Internal Server Error) | Unexpected error in the database or server                      |

### Command Line Example:

```
Retrieve Question by ID:
curl -X GET http://localhost:8081/questions/1
```

### Example of Response Body for Success:

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

## Get Question by Parameters (Random)

This endpoint allows the retrieval of random questions that matches the parameters provided.

- **HTTP Method**: `GET`
- **Endpoint**: `/questions/search`

### Parameters:

- `limit` (Optional) - The number of questions to be returned. If not provided, default limit is 1.
- `topics` (Required) - The topic of the question.
- `difficulty` (Required) - The difficulty of the question.

### Responses:

| Response Code               | Explanation                                                                               |
|-----------------------------|-------------------------------------------------------------------------------------------|
| 200 (OK)                    | Success, questions corresponding to the `limit`, `topics`, and `difficulty` are returned. |
| 400 (Bad Request)           | Missing fields                                                                            |
| 404 (Not Found)             | Question with the specified parameter(s) not found                                        |
| 500 (Internal Server Error) | Unexpected error in the database or server                                                |

### Command Line Example:

```
Retrieve Random Question by Topics and Difficulty:
curl -X GET "http://localhost:8081/questions/search?topics=Algorithms&difficulty=Medium"

Retrieve Random Question by Topics, Difficulty, and Limit:
curl -X GET "http://localhost:8081/questions/search?topics=Algorithms,Data%20Structures&difficulty=Easy&limit=5"
```

### Example of Response Body for Success:

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

## Get Topics

This endpoint retrieves all unique topics in the database

- **HTTP Method**: `GET`
- **Endpoint**: `/questions/topics`

### Responses:

| Response Code               | Explanation                                                        |
|-----------------------------|--------------------------------------------------------------------|
| 200 (OK)                    | Success, all topics are returned                                   |
| 500 (Internal Server Error) | The server encountered an error and could not complete the request |

### Command Line Example:

```
Retrieve Topics:
curl -X GET http://localhost:8081/questions/topics
```

### Example of Response Body for Success:

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

## Add Question

This endpoint allows the addition of a new question.

- **HTTP Method**: `POST`
- **Endpoint**: `/questions`

### Parameters:

- `id` (Required) - The unique ID of the question.
- `title` (Required) - The title of the question.
- `description` (Required) - A description of the question.
- `topics` (Required) - The topics associated with the question.
- `difficulty` (Required) - The difficulty level of the question.

### Responses:

| Response Code               | Explanation                                                    |
|-----------------------------|----------------------------------------------------------------|
| 201 (Created)               | The question is created successfully.                          |
| 400 (Bad Request)           | Required fields are missing or invalid or `id` already exists. |
| 500 (Internal Server Error) | Unexpected error in the database or server.                    |

### Command Line Example:

```
Add Question:
curl -X POST http://localhost:8081/questions -H "Content-Type: application/json" -d "{\"id\": 21, \"title\": \"New Question\", \"description\": \"This is a description for a new question.\", \"topics\": [\"Data Structures\", \"Algorithms\"], \"difficulty\": \"Medium\"}"
```

### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question created successfully",
  "data": {
    "id": 21,
    "title": "New Question",
    "description": "This is a description for a new question.",
    "topics": [
      "Data Structures",
      "Algorithms"
    ],
    "difficulty": "Medium",
    "_id": "66eedf739672ca081e9fd5ff"
  }
}
```

---

## Update Question

This endpoint allows updating an existing question. Only the title, description, topics, and difficulty can be updated.

- **HTTP Method**: `PUT`
- **Endpoint**: `/questions/{questionId}`

### Request Parameters:

- `questionId` (Required) - The ID of the question to update.

### Request Body:

- `title` (Optional) - New title for the question.
- `description` (Optional) - New description for the question.
- `topics` (Optional) - New topics for the question.
- `difficulty` (Optional) - New difficulty level for the question.

### Responses:

| Response Code               | Explanation                                         |
|-----------------------------|-----------------------------------------------------|
| 200 (OK)                    | Success, the question is updated successfully.      |
| 404 (Not Found)             | Question with the specified `questionId` not found. |
| 500 (Internal Server Error) | Unexpected error in the database or server.         |

### Command Line Example:

```
Update Question:
curl -X PUT http://localhost:8081/questions/21 -H "Content-Type: application/json" -d "{\"title\": \"Updated Question Title\", \"description\": \"This is the updated description.\", \"topics\": [\"Updated Topic\"], \"difficulty\": \"Hard\"}"
```

### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question updated successfully",
  "data": {
    "_id": "66eedf739672ca081e9fd5ff",
    "id": 21,
    "title": "Updated Title",
    "description": "Updated description for the existing question.",
    "topics": [
      "Data Structures",
      "Algorithms"
    ],
    "difficulty": "Hard"
  }
}
```

---

## Delete Question

This endpoint allows the deletion of a question by the question ID.

- **HTTP Method**: `DELETE`
- **Endpoint**: `/questions/{questionId}`

### Parameters:

- `questionId` (Required) - The ID of the question to delete.

### Responses:

| Response Code               | Explanation                                         |
|-----------------------------|-----------------------------------------------------|
| 200 (OK)                    | Success, the question is deleted successfully.      |
| 404 (Not Found)             | Question with the specified `questionId` not found. |
| 500 (Internal Server Error) | Unexpected error in the database or server.         |

### Command Line Example:

```
Delete Question:
curl -X DELETE http://localhost:8081/questions/21
```

### Example of Response Body for Success:

```json
{
  "status": "Success",
  "message": "Question deleted successfully",
  "data": {
    "_id": "66eedf739672ca081e9fd5ff",
    "id": 21,
    "title": "Updated Title",
    "description": "Updated description for the existing question.",
    "topics": [
      "Data Structures",
      "Algorithms"
    ],
    "difficulty": "Hard"
  }
}
```

---
