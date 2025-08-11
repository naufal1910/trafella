# Feature Spec: AI-Powered Itinerary Generator (v0.1)

- **Date**: 2025-08-04
- **Status**: Defined

## 1. Overview

This document specifies the requirements for the Minimum Viable Product (MVP) of the **AI-Powered Itinerary Generator**, the core feature of Trafella.

## 2. Primary Goal

Deliver a one-shot itinerary creator that proves Trafella’s core value. Users will enter a destination, travel dates, and high-level interests, and receive a clear, day-by-day plan in under 10 seconds. The primary success metric is achieving a “useful” or “very useful” rating from ≥70% of first-time testers.

## 3. Scope

### In Scope (v0.1)

1.  **Frontend Form (Vue 3)**: A simple interface with fields for destination, start/end dates, trip theme/interests (tags), and an optional daily budget.
2.  **Backend Endpoint (FastAPI)**: A `/generate-itinerary` endpoint that validates input, constructs a detailed prompt, calls the selected LLM (e.g., GPT-4o), and streams back a structured JSON response.
3.  **Results View**: A clean UI that displays the generated itinerary with each day presented in a collapsible card.
4.  **Basic Telemetry**: Logging of success/failure rates and latency for performance monitoring.
5.  **LLM Abstraction**: A configuration flag to switch between LLM providers (e.g., OpenAI, Google) without requiring a redeployment.

### Out of Scope (v0.1)

-   User accounts and database persistence.
-   Map views or any form of geocoding.
-   Multi-destination or complex routing.
-   Interactive features like drag-and-drop reordering.
-   RAG-based personalization or user history.
-   Real-time data checks (e.g., costs, availability).
-   Exporting, saving, or sharing itineraries.

## 4. User Stories

1.  **As a solo traveler booking a last-minute getaway**, I want to enter a destination and dates to instantly receive a full day-by-day plan, so that I can avoid hours of research and feel confident my trip is covered.
2.  **As a busy parent planning a family holiday**, I want to add our interests (e.g., kid-friendly) and an optional budget, so that the suggested activities fit my children’s ages and our spending limit.
3.  **As an eco-conscious backpacker**, I want to tag my trip theme (e.g., “nature,” “low cost”), so that the plan highlights free or affordable outdoor experiences.
4.  **As a first-time user**, I want the plan displayed in clear, collapsible day cards, so that I can skim each day quickly.
5.  **As a user evaluating the product**, I want each itinerary generation to finish in under 10 seconds, so that I trust the tool is responsive.

## 5. Required Integrations

-   **FastAPI Backend** (Python 3.11)
-   **Vue 3 Frontend** (Vite, Pinia)
-   **LLM Provider API** (OpenAI or Google Gemini)
-   **Logging/Monitoring Service** (e.g., Sentry, Grafana Cloud)
