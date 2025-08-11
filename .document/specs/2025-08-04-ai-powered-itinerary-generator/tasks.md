# Task List: AI-Powered Itinerary Generator (MVP)

This file breaks down the work required to build the MVP, based on the approved feature spec.

---

### Major Task 1: Build the Itinerary Generation API Endpoint

**Goal**: Create a functional and tested FastAPI service that can generate an itinerary from a set of user inputs.

- [x] **1.1 (Test)** Write integration tests for the `/generate-itinerary` endpoint, covering valid requests and error cases.
- [x] **1.2** Set up the initial FastAPI application structure, including `pyproject.toml` and a main `app` directory.
- [x] **1.3** Create Pydantic models for `ItineraryRequest` and `ItineraryResponse` to define the API contract.
- [x] **1.4** Create the prompt template file (`prompts/itinerary_v1.txt`).
- [x] **1.5** Implement an LLM client wrapper to abstract calls to the AI provider.
- [x] **1.6** Implement the core generator service to manage prompt creation and LLM interaction.
- [x] **1.7** Create the API router and the `/generate-itinerary` endpoint.
- [x] **1.8** Verify that all backend tests pass successfully.

---

### Major Task 2: Develop the Frontend User Interface

**Goal**: Build the Vue.js components for user input and itinerary display.

- [x] **2.1 (Test)** Write component tests for the input form and results display, mocking the API call.
- [x] **2.2** Initialize the Vue 3 project using Vite and install dependencies (Pinia, Tailwind CSS).
- [x] **2.3** Create the main itinerary form component with input fields for destination, dates, interests, budget, and party size.
- [x] **2.4** Create the itinerary display component to show the generated day-by-day plan.
- [x] **2.5** Set up a Pinia store to manage the itinerary state and API calls.
- [x] **2.6** Integrate the frontend components with the backend API endpoint.
- [x] **2.7** Add basic styling using Tailwind CSS for a clean, responsive UI.
- [x] **2.8** Verify that all frontend tests pass successfully.

---

### Major Task 3: Integrate Frontend, Backend, and Deploy MVP

**Goal**: Connect the frontend and backend, and deploy a working version to a staging environment.

- [x] **3.1 (Test)** Write a basic end-to-end test for the form submission and result display flow.
- [x] **3.2** Configure CORS in the FastAPI backend.
- [x] **3.3** Implement the live API call in the Pinia store.
- [x] **3.4** Add basic telemetry hooks for logging and monitoring.
- [x] **3.5** Create deployment configurations (`Dockerfile`, `vercel.json`).
- [ ] **3.6** Deploy the application to a staging environment (Vercel/Fly.io).
- [ ] **3.7** Verify the end-to-end flow on the live staging URL.
