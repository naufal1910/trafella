# Task List: AI-Powered Itinerary Generator (MVP)

This file breaks down the work required to build the MVP, based on the approved feature spec.

---

### Major Task 1: Build the Itinerary Generation API Endpoint

**Goal**: Create a functional and tested FastAPI service that can generate an itinerary from a set of user inputs.

- [ ] **1.1 (Test)** Write integration tests for the `/generate-itinerary` endpoint, covering valid requests and error cases.
- [ ] **1.2** Set up the initial FastAPI application structure, including `pyproject.toml` and a main `app` directory.
- [ ] **1.3** Create Pydantic models for `ItineraryRequest` and `ItineraryResponse` to define the API contract.
- [ ] **1.4** Create the prompt template file (`prompts/itinerary_v1.txt`).
- [ ] **1.5** Implement an LLM client wrapper to abstract calls to the AI provider.
- [ ] **1.6** Implement the core generator service to manage prompt creation and LLM interaction.
- [ ] **1.7** Create the API router and the `/generate-itinerary` endpoint.
- [ ] **1.8** Verify that all backend tests pass successfully.

---

### Major Task 2: Develop the Frontend User Interface

**Goal**: Build the Vue.js components for user input and itinerary display.

- [ ] **2.1 (Test)** Write component tests for the input form and results display, mocking the API call.
- [ ] **2.2** Initialize the Vue 3 project using Vite and install dependencies (Pinia, Tailwind CSS).
- [ ] **2.3** Create the `useItineraryStore` with Pinia to manage application state.
- [ ] **2.4** Develop the `ItineraryGeneratorForm.vue` component.
- [ ] **2.5** Develop the `ItineraryResults.vue` and `DayCard.vue` components.
- [ ] **2.6** Assemble the main application view.
- [ ] **2.7** Verify that all frontend component tests pass successfully.

---

### Major Task 3: Integrate Frontend, Backend, and Deploy MVP

**Goal**: Connect the frontend and backend, and deploy a working version to a staging environment.

- [ ] **3.1 (Test)** Write a basic end-to-end test for the form submission and result display flow.
- [ ] **3.2** Configure CORS in the FastAPI backend.
- [ ] **3.3** Implement the live API call in the Pinia store.
- [ ] **3.4** Add basic telemetry hooks for logging and monitoring.
- [ ] **3.5** Create deployment configurations (`Dockerfile`, `vercel.json`).
- [ ] **3.6** Deploy the application to a staging environment (Vercel/Fly.io).
- [ ] **3.7** Verify the end-to-end flow on the live staging URL.
