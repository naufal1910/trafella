---
description: Create a detailed feature spec based on roadmap or idea
---

# 🔧 Workflow Name: create-spec
# 📌 Purpose: Create a detailed feature spec based on roadmap or idea

steps:
  - id: spec_source
    title: "🧩 Where is this spec coming from?"
    type: choice
    options:
      - label: "Use next item from the roadmap"
        value: from_roadmap
      - label: "I have a specific idea"
        value: custom

  - id: fetch_from_roadmap
    if: spec_source == "from_roadmap"
    title: "📋 Select roadmap item"
    type: form
    fields:
      - id: roadmap_feature
        label: "Enter the next uncompleted roadmap feature"
        type: short_text

  - id: enter_custom_spec
    if: spec_source == "custom"
    title: "💡 Describe your feature idea"
    type: form
    fields:
      - id: spec_title
        label: "Feature Title"
        type: short_text
      - id: spec_idea
        label: "Describe what this feature should do"
        type: paragraph

  - id: clarify_scope
    if: true
    title: "🔍 Clarify Scope & Details"
    type: form
    fields:
      - id: feature_goals
        label: "What is the goal of this feature?"
        type: paragraph
      - id: in_scope
        label: "What is IN scope?"
        type: list
        placeholder: "e.g., User can..."
      - id: out_of_scope
        label: "What is OUT of scope? (optional)"
        type: list
      - id: integration_points
        label: "What needs to be integrated?"
        type: list
        placeholder: "e.g., OpenAI API, Stripe, DB"

  - id: write_user_stories
    title: "🧑‍💻 Define User Stories"
    type: repeatable
    item_label: "User Story"
    fields:
      - id: actor
        label: "Who is the user?"
        type: short_text
      - id: action
        label: "What do they want to do?"
        type: short_text
      - id: benefit
        label: "What is the benefit?"
        type: short_text
      - id: flow_description
        label: "Workflow / Notes"
        type: paragraph

  - id: generate_spec_files
    title: "📁 Generate Spec Files"
    type: action
    action: |
      Create the following files:
      - `.document/specs/YYYY-MM-DD-{{spec_title_kebab}}/spec.md`
      - `.document/specs/YYYY-MM-DD-{{spec_title_kebab}}/spec-lite.md`
      - `.document/specs/YYYY-MM-DD-{{spec_title_kebab}}/sub-specs/technical-spec.md`
      
      Conditionally create:
      - `database-schema.md` if DB changes needed
      - `api-spec.md` if API endpoints involved

  - id: confirm_tasks
    title: "✅ Confirm Feature Scope"
    type: summary
    content: |
      You're about to create a feature spec with:
      - Title: {{spec_title || roadmap_feature}}
      - Goal: {{feature_goals}}
      - Scope: {{in_scope.join(', ')}}
      - Out of Scope: {{out_of_scope.join(', ') || 'N/A'}}
      - Integrations: {{integration_points.join(', ')}}
      - Stories: {{user_stories.length}} user story(ies)

  - id: next_step_suggestion
    title: "🚀 Ready to break into tasks?"
    type: message
    content: |
      Your spec is ready. Run the `create-tasks` workflow to turn this into an actionable task list with subtasks.
