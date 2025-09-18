# tz-aware_events - An Event Management API

A Node.js REST API for managing events with timezone support and recurring event capabilities.

## Features

- Create, read, update, and delete events
- Timezone-aware event handling
- Recurring events (daily, weekly, monthly, yearly)
- View events in any timezone
- Next occurrence calculation for recurring events

## Installation

```bash
npm install
```

Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/events
```

Start server:
```bash
npm start
```

## API Endpoints

**Base URL:** `/api/v1/events`

- `GET /` - Get all events
- `GET /:id` - Get event by ID
- `POST /` - Create event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `DELETE /` - Delete all events

**Query Parameter:** `?timeZone=America/New_York` (optional, defaults to UTC)

## Request/Response Example

**Create Event:**
```json
POST /api/v1/events
{
  "description": "Team Meeting",
  "eventTime": "2024-03-15T14:30:00",
  "timeZone": "America/New_York",
  "isRecurring": true,
  "recurrence": {
    "frequency": "weekly",
    "time": "14:30",
    "daysOfWeek": [1, 3, 5]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f4a1b2c3d4e5f6789abcde",
    "description": "Team Meeting",
    "originalTimeZone": "America/New_York",
    "isRecurring": true,
    "recurrence": { "frequency": "weekly", "time": "14:30", "daysOfWeek": [1, 3, 5] },
    "originalEventTime": "2024-03-15T14:30:00",
    "yourEquivalentEventTime": "2024-03-15T19:30:00",
    "nextOccurrence": "2024-03-18T14:30:00"
  }
}
```

## Recurring Events

**Frequencies:** `daily`, `weekly`, `monthly`, `yearly`

**Configuration:**
- Daily: `{ "frequency": "daily", "time": "09:00" }`
- Weekly: `{ "frequency": "weekly", "time": "14:30", "daysOfWeek": [1, 3, 5] }` (1=Monday, 7=Sunday)
- Monthly: `{ "frequency": "monthly", "time": "10:00", "dayOfMonth": 15 }`
- Yearly: `{ "frequency": "yearly", "time": "12:00", "dayOfMonth": 15, "monthOfYear": 3 }`

## Timezone Support

- Events store original timezone and display in viewer's preferred timezone
- Use IANA timezone identifiers: `America/New_York`, `Europe/London`, `Asia/Tokyo`, etc.
- Response includes both `originalEventTime` and `yourEquivalentEventTime`

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

**Status Codes:** 200 (Success), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)

## Testing the API

**For Evaluators/Testers:**

You can test all CRUD operations using any of these methods:

### Method 1: Using Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new request for each endpoint:
   - Set base URL: `http://tz-aware-events.onrender.com/api/v1/events`
   - Add header: `Content-Type: application/json`
   - Use the JSON examples below for request bodies

### Method 2: Using cURL commands

**Create Event:**
```bash
curl -X POST https://tz-aware-events.onrender.com/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Meeting",
    "eventTime": "2024-03-20T14:30:00",
    "timeZone": "America/New_York",
    "isRecurring": false
  }'
```

**Get All Events:**
```bash
curl https://tz-aware-events.onrender.com/api/v1/events
```

**Update Event (replace EVENT_ID with actual ID):**
```bash
curl -X PUT https://tz-aware-events.onrender.com/api/v1/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated Meeting",
    "eventTime": "2024-03-21T15:00:00",
    "timeZone": "America/New_York"
  }'
```

**Delete Event:**
```bash
curl -X DELETE https://tz-aware-events.onrender.com/api/v1/events/EVENT_ID
```

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose  
- Luxon for date/time handling
- CORS enabled
