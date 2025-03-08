# Dictation Manager API Reference

This document provides details on the API endpoints available in the Dictation Manager application, their request/response formats, and usage examples.

## Base URL

All API endpoints are relative to the base URL of your Dictation Manager installation.

For development: `http://localhost:3000/api`  
For production: `https://your-domain.com/api`

## Authentication

Most API endpoints require authentication. To authenticate requests, you need to:

1. Be logged in to the application (using Firebase Authentication)
2. Session cookies will be automatically included in requests

## API Endpoints

### Dictation Games

#### Get a Dictation Game

Retrieves a single dictation game by ID.

```
GET /dictation/play/{id}
```

**Parameters:**

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Dictation game ID |

**Response:**

```json
{
  "id": "game123",
  "title": "Basic Spanish Vocabulary",
  "description": "Learn common Spanish words",
  "sourceLanguage": "en",
  "targetLanguage": "es",
  "wordPairs": [
    {
      "first": "hello",
      "second": "hola",
      "sentence": "Hello, how are you?"
    },
    // more word pairs...
  ],
  "quizParameters": {
    "globalTimeLimit": 300,
    "globalLivesLimit": 3,
    "activityTimeLimit": 30,
    "quizModeEnabled": false
  },
  "createdAt": "2023-01-15T12:30:45Z",
  "updatedAt": "2023-01-15T14:20:15Z",
  "isPublic": true,
  "playCount": 42
}
```

**Status Codes:**

- `200 OK`: Game retrieved successfully
- `404 Not Found`: Game not found
- `403 Forbidden`: Not authorized to access this game

#### Increment Play Count

Increments the play count for a dictation game.

```
POST /dictation/play/{id}
```

**Parameters:**

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Dictation game ID |

**Response:**

```json
{
  "success": true,
  "playCount": 43
}
```

**Status Codes:**

- `200 OK`: Play count incremented successfully
- `404 Not Found`: Game not found
- `500 Internal Server Error`: Failed to increment play count

#### Create a Dictation Game

Creates a new dictation game.

```
POST /dictation/create
```

**Request Body:**

```json
{
  "title": "Spanish Food Vocabulary",
  "description": "Learn common Spanish food terms",
  "sourceLanguage": "en",
  "targetLanguage": "es",
  "wordPairs": [
    {
      "first": "apple",
      "second": "manzana",
      "sentence": "I eat an apple every day."
    },
    // more word pairs...
  ],
  "quizParameters": {
    "globalTimeLimit": 300,
    "globalLivesLimit": 3,
    "activityTimeLimit": 30,
    "quizModeEnabled": false
  },
  "isPublic": true
}
```

**Response:**

```json
{
  "success": true,
  "gameId": "newgame123",
  "redirect": "/dictation/edit/newgame123"
}
```

**Status Codes:**

- `201 Created`: Game created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Failed to create game

#### Update a Dictation Game

Updates an existing dictation game.

```
PUT /dictation/edit/{id}
```

**Parameters:**

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Dictation game ID |

**Request Body:**

Same format as the Create endpoint.

**Response:**

```json
{
  "success": true,
  "gameId": "game123"
}
```

**Status Codes:**

- `200 OK`: Game updated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to update this game
- `404 Not Found`: Game not found
- `500 Internal Server Error`: Failed to update game

#### Delete a Dictation Game

Deletes a dictation game.

```
DELETE /dictation/game/{id}
```

**Parameters:**

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Dictation game ID |

**Response:**

```json
{
  "success": true
}
```

**Status Codes:**

- `200 OK`: Game deleted successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to delete this game
- `404 Not Found`: Game not found
- `500 Internal Server Error`: Failed to delete game

### Content Generation

#### Generate Word Pairs

Generates word pairs using AI.

```
POST /dictation/generate-content
```

**Request Body:**

```json
{
  "sourceLanguage": "en",
  "targetLanguage": "es",
  "topic": "Food and Dining",
  "count": 10,
  "includeExampleSentences": true
}
```

**Response:**

```json
{
  "success": true,
  "wordPairs": [
    {
      "first": "restaurant",
      "second": "restaurante",
      "sentence": "We had dinner at a nice restaurant."
    },
    // more generated word pairs...
  ]
}
```

**Status Codes:**

- `200 OK`: Content generated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Failed to generate content

### User Data

#### Get User Games

Retrieves all dictation games created by the authenticated user.

```
GET /user/games
```

**Response:**

```json
{
  "games": [
    {
      "id": "game123",
      "title": "Basic Spanish Vocabulary",
      "description": "Learn common Spanish words",
      "sourceLanguage": "en",
      "targetLanguage": "es",
      "wordPairsCount": 15,
      "createdAt": "2023-01-15T12:30:45Z",
      "updatedAt": "2023-01-15T14:20:15Z",
      "isPublic": true,
      "playCount": 42
    },
    // more games...
  ]
}
```

**Status Codes:**

- `200 OK`: Games retrieved successfully
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Failed to retrieve games

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:

- `AUTHENTICATION_REQUIRED`: User is not authenticated
- `PERMISSION_DENIED`: User does not have permission
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `INVALID_REQUEST`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse. The current limits are:

- Regular API calls: 100 requests per minute
- Content generation: 10 requests per minute

When rate limited, the API will respond with a `429 Too Many Requests` status code.

## Webhooks (Future Feature)

Webhook support for game creation and updates is planned for a future release.

## SDK (Future Feature)

A JavaScript SDK for easier integration is planned for a future release. 