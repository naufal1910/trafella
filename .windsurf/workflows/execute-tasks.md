---
description: Execute all tasks in a spec
---

# 🔧 Workflow Name: execute-tasks
# 📌 Purpose: Execute all tasks in a spec using execute-task cascade

steps:
  - id: select_spec
    title: "📄 Select Spec to Execute"
    type: form
    fields:
      - id: spec_folder
        label: "Spec Folder (YYYY-MM-DD-feature-name)"
        type: short_text
        placeholder: "e.g., 2025-08-04-generate-itinerary"

  - id: confirm_execution
    title: "🚀 Ready to Execute All Tasks?"
    type: message
    content: |
      This workflow will:
      - Load `tasks.md` from the spec folder
      - Identify all incomplete parent tasks
      - Execute each task using `execute-task`
      - Run full test suite at the end
      - Push code and create a PR

  - id: branch_setup
    title: "🌿 Git Branch Setup"
    type: action
    action: |
      Use the spec name (excluding the date) to create or switch to a Git branch.
      Example:
      - Folder: `2025-08-04-generate-itinerary`
      - Branch: `generate-itinerary`

  - id: task_loop
    title: "🔁 Loop Through All Tasks"
    type: loop
    source: |
      Parse `tasks.md` from `.agent-os/specs/{{spec_folder}}/`
      Identify all uncompleted parent tasks (e.g., 1, 2, 3)
    steps:
      - use_workflow: execute-task
        with:
          spec_folder: "{{spec_folder}}"
          task_number: "{{current_task_number}}"

  - id: run_all_tests
    title: "🧪 Run Full Test Suite"
    type: action
    action: |
      Run the complete test suite (not just task-specific ones):
      - `pytest` or `vitest` depending on backend/frontend
      - Fix regressions
      - Ensure 100% pass before proceeding

  - id: create_pr
    title: "📦 Create Pull Request"
    type: action
    action: |
      - Commit changes from spec branch
      - Push to GitHub
      - Open a pull request to `main`
      - Use commit message format: `feat({{spec_folder}}): implement feature`
      - PR description should summarize key changes and testing notes

  - id: check_roadmap_update
    title: "🗺️ Check If Roadmap Should Be Updated"
    type: choice
    options:
      - label: "Yes, this spec completes a roadmap feature"
        value: update_roadmap
      - label: "No, this spec is internal or support-only"
        value: skip_roadmap

  - id: update_roadmap
    if: check_roadmap_update == "update_roadmap"
    title: "📌 Mark Feature as Completed in Roadmap"
    type: action
    action: |
      In `.agent-os/product/roadmap.md`, locate the feature implemented by this spec and:
      - Mark as complete `[x]`
      - Add a note if needed about scope or outcome

  - id: summary
    title: "✅ Execution Summary"
    type: message
    content: |
      🎉 All tasks for `{{spec_folder}}` have been executed.

      🔍 Tests: ✅ Full suite passed  
      🔃 Git: Branch pushed & PR created  
      🗺️ Roadmap: {{check_roadmap_update == "update_roadmap" ? '✔ Updated' : '❌ Skipped'}}

      You may now continue to your next spec or start another cycle!
