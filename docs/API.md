# 🔌 API Documentation

**Complete API reference for Moodle AI Assistant local server**

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required for local development.

---

## 🏥 Health & Status

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-10-27T10:30:00.000Z",
  "version": "0.1.0"
}
```

### GET /stats
System statistics.

**Response:**
```json
{
  "courses": 15,
  "users": 234,
  "questions": 456,
  "conversations": 89
}
```

---

## 🤖 AI Endpoints

### POST /ai/query
Process AI query with context.

**Request:**
```json
{
  "query": "Review my electronics course",
  "sessionId": "user-session-123"
}
```

**Response:**
```json
{
  "content": "I've analyzed your Electronics Fundamentals course...",
  "provider": "claude",
  "processingTime": 2500,
  "confidence": 0.9
}
```

---

## 🧠 Context Endpoints

### POST /context/build
Build context for AI query.

**Request:**
```json
{
  "query": "Create new course",
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "context": "=== MOODLE CONTEXT ===\n\nSYSTEM OVERVIEW:\n- Action Type: create\n..."
}
```

### POST /context/save
Save interaction context.

**Request:**
```json
{
  "sessionId": "session-123",
  "userInput": "Create course",
  "aiResponse": "I can help create...",
  "contextUsed": [],
  "actionTaken": "create"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 📚 Moodle Data Endpoints

### GET /moodle/courses
Get all courses.

**Response:**
```json
[
  {
    "id": 1,
    "fullname": "Electronics Fundamentals",
    "shortname": "ELEC101",
    "enrolled_users": 23,
    "quiz_count": 3
  }
]
```

### GET /moodle/users
Get all users.

**Response:**
```json
[
  {
    "id": 1,
    "username": "student1",
    "firstname": "John",
    "lastname": "Doe",
    "enrolled_courses": 2,
    "last_activity": "2023-10-27T09:15:00.000Z"
  }
]
```

### GET /moodle/questions
Get questions, optionally filtered by category.

**Query Parameters:**
- `category` (optional): Filter by category ID

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ohm's Law Question",
    "qtype": "multichoice",
    "defaultmark": 1.0,
    "category_id": 5
  }
]
```

---

## 🔄 Sync Endpoints

### POST /sync/full
Full synchronization with Moodle database.

**Request:**
```json
{
  "moodleConfig": {
    "host": "localhost",
    "port": 3306,
    "database": "moodle",
    "user": "moodle_readonly",
    "password": "password"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Full sync completed"
}
```

### POST /sync/courses
Sync only courses.

**Request:**
```json
{
  "moodleConfig": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Courses synced"
}
```

---

## 🎯 Pattern Endpoints

### GET /patterns/:type
Get admin pattern by type.

**Parameters:**
- `type`: Pattern type (e.g., "course_creation", "user_management")

**Response:**
```json
{
  "preferences": {
    "modules": 5,
    "format": "topics",
    "quizzes": true
  },
  "frequency": 3,
  "timestamp": "2023-10-27T10:00:00.000Z"
}
```

### POST /patterns/:type
Save admin pattern.

**Request:**
```json
{
  "data": {
    "preferences": {
      "modules": 6,
      "format": "weeks"
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 💬 Conversation Endpoints

### GET /conversations/:sessionId
Get conversation history.

**Parameters:**
- `sessionId`: Session identifier

**Query Parameters:**
- `limit` (optional): Number of conversations to return (default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "user_input": "Create new course",
    "ai_response": "I can help you create...",
    "context_used": "...",
    "action_taken": "create",
    "ai_provider": "claude",
    "created_at": "2023-10-27T10:00:00.000Z"
  }
]
```

---

## 📊 AI Service Endpoints

### GET /ai/providers
Get AI provider statistics.

**Response:**
```json
{
  "providers": [
    {
      "name": "claude",
      "enabled": true,
      "priority": 1,
      "capabilities": ["reasoning", "analysis", "planning"]
    }
  ],
  "totalConversations": 89,
  "browserAutomation": {
    "initialized": true,
    "status": "ready"
  }
}
```

### POST /ai/providers/:name/toggle
Enable/disable AI provider.

**Parameters:**
- `name`: Provider name (claude, chatgpt, gemini)

**Request:**
```json
{
  "enabled": false
}
```

**Response:**
```json
{
  "success": true
}
```

---

## ❌ Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Development

### Testing Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Get stats
curl http://localhost:3000/api/stats

# AI query
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "sessionId": "test"}'

# Build context
curl -X POST http://localhost:3000/api/context/build \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "sessionId": "test"}'
```

### Rate Limiting
No rate limiting implemented for local development.

### CORS
CORS enabled for all origins in development mode.

---

**API is designed for local development and VS Code extension integration.**