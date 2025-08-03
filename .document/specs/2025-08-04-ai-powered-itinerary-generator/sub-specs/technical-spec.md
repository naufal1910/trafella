# Technical Spec: AI-Powered Itinerary Generator (v0.1)

## 1. Frontend (Vue 3)

-   **Component**: `ItineraryGenerator.vue`
    -   **State Management (Pinia)**: A `useItineraryStore` will manage form state (`destination`, `dates`, `interests`, `budget`), loading status, and the final `itineraryResult` (JSON).
    -   **Form**: Standard HTML form elements bound to the Pinia store. Date inputs will use a lightweight date picker component.
    -   **API Call**: On form submission, an action in the store will call our FastAPI backend using `httpx` or `fetch`.
-   **Component**: `ItineraryResults.vue`
    -   Receives the `itineraryResult` as a prop.
    -   Renders a `v-for` loop over the `days` array.
    -   Each day is a `DayCard.vue` component with a collapsible body containing the day's plan.

## 2. Backend (FastAPI)

-   **Router**: `routers/itinerary.py` will define the `/generate-itinerary` endpoint.
-   **Pydantic Models**: `schemas/itinerary.py` will define `ItineraryRequest` for input validation and `ItineraryResponse` for the structured output.
-   **Service Layer**: `services/ai/generator.py` will contain the core logic.
    -   A `GeneratorService` class will be responsible for:
        1.  Receiving the validated `ItineraryRequest`.
        2.  Loading a prompt template from `prompts/itinerary_v1.txt`.
        3.  Populating the template with user input.
        4.  Calling the LLM wrapper to get the AI-generated plan.
        5.  Parsing the LLM output to ensure it matches the `ItineraryResponse` schema.
-   **LLM Wrapper**: `services/ai/llm_client.py`
    -   An abstract base class `LLMClient` will define a common `generate` method.
    -   Concrete implementations like `OpenAIClient` and `GoogleClient` will handle the specific API calls.
    -   A factory function will instantiate the correct client based on an environment variable (`LLM_PROVIDER`).

## 3. Data Flow

1.  User fills form in Vue App.
2.  Pinia store state is updated.
3.  On submit, an action calls `POST /api/v1/generate-itinerary` with the form data.
4.  FastAPI validates the request against the `ItineraryRequest` Pydantic model.
5.  The router passes the request data to the `GeneratorService`.
6.  The service builds the prompt and uses the `LLMClient` to call the external AI API.
7.  The LLM response (JSON) is parsed and validated against the `ItineraryResponse` model.
8.  FastAPI returns the structured JSON to the Vue app.
9.  The Pinia store is updated with the result, and the `ItineraryResults` component renders the data.
