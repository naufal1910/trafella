---
description: Execute a single major task and its subtasks using TDD
---

# 🔧 Workflow Name: execute-task
# 📌 Purpose: Execute a single major task and its subtasks using TDD

steps:
  - id: select_task
    title: "📋 Select Task to Execute"
    type: form
    fields:
      - id: spec_folder
        label: "Spec Folder (YYYY-MM-DD-task-name)"
        type: short_text
      - id: task_number
        label: "Which parent task number are you working on?"
        type: number
        placeholder: "e.g., 1"

  - id: load_task_and_spec
    title: "📂 Load Task & Technical Spec"
    type: action
    action: |
      Load from:
      - `tasks.md` → task {{task_number}} and its subtasks
      - `technical-spec.md` → extract sections relevant to this task
      - `dev-best-practices.md` and `code-style.md` → extract matching tech/language rules

  - id: summarize_requirements
    title: "📌 Confirm What You’re Building"
    type: summary
    content: |
      You're about to implement:
      - Task: {{task_number}} from `tasks.md`
      - Subtasks: parsed from 1.1, 1.2, 1.3...
      - Based on: `technical-spec.md` details + code conventions

  - id: write_tests
    title: "🧪 Write Tests First"
    type: action
    action: |
      Implement the first subtask: **Write tests** for the current task.
      - Unit tests, integration tests, edge cases
      - Write tests that are expected to fail
      - Use testing conventions from code style guide
    completion_message: "✅ Tests written and failing as expected?"

  - id: implement_logic
    title: "🔨 Implement Feature"
    type: repeatable
    item_label: "Implementation Subtask"
    fields:
      - id: step_description
        label: "Describe sub-implementation step"
        type: paragraph
        placeholder: "E.g., Build FastAPI route handler"
    instructions: |
      For each subtask:
      - Build the required functionality
      - Make the corresponding test(s) pass
      - Refactor if needed

  - id: verify_tests
    title: "✅ Run Task-Specific Tests"
    type: action
    action: |
      Run only the tests related to this task using your test runner (e.g., `pytest`, `vitest`).
      - Fix any failing tests
      - Ensure all tests for this feature pass

  - id: update_task_status
    title: "📒 Update Task Status"
    type: choice
    options:
      - label: "Mark task as complete"
        value: complete
      - label: "Task is blocked"
        value: blocked
    instructions: |
      If blocked, document what you've tried and where you're stuck.

  - id: log_blocking_issue
    if: update_task_status == "blocked"
    title: "⚠️ Log Blocking Issue"
    type: form
    fields:
      - id: blocking_description
        label: "What is blocking you?"
        type: paragraph
        placeholder: "e.g., API credentials missing, undefined response format, etc."
      - id: attempts
        label: "How many solutions did you try?"
        type: number
    instructions: |
      If you've tried 3 different approaches and failed, this should be marked as blocked with ⚠️ in `tasks.md`.

  - id: done
    title: "🎉 Task Execution Complete"
    type: message
    content: |
      You've finished executing Task {{task_number}}.
      ✅ Tests written  
      ✅ Logic implemented  
      ✅ Tests verified  
      {{update_task_status == "blocked" ? "⚠️ Task marked as BLOCKED" : "✅ Task marked as COMPLETE"}}

      You may now run `execute-task` again for the next task or switch to `execute-tasks` for batch execution.
