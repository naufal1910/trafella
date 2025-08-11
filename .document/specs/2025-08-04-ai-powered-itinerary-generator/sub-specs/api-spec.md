# API Spec: Itinerary Generation

## `POST /api/v1/generate-itinerary`

Generates a travel itinerary based on user inputs.

### Request Body

```json
{
  "destination": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "interests": [
    "string"
  ],
  "budget": "string (e.g., 'low', 'medium', 'high')",
  "party_size": "integer"
}
```

### Response Body (Success: 200 OK)

Provides a structured itinerary. The response will be streamed.

```json
{
  "request_id": "uuid",
  "destination": "string",
  "duration_days": "integer",
  "itinerary": {
    "days": [
      {
        "day_number": "integer",
        "date": "YYYY-MM-DD",
        "title": "string",
        "summary": "string",
        "activities": {
          "morning": "string",
          "afternoon": "string",
          "evening": "string"
        },
        "tips": "string"
      }
    ]
  }
}
```

### Error Responses

-   **422 Unprocessable Entity**: If the request body fails validation.
-   **500 Internal Server Error**: If the LLM call fails or an unexpected error occurs.
