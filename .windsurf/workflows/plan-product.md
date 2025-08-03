---
description: Collect foundational product info and generate project scaffolding
---

# 🔧 Workflow Name: plan-product
# 📌 Purpose: Collect foundational product info and generate project scaffolding

steps:
  - id: collect_main_idea
    title: "🧠 What is your product idea?"
    type: form
    fields:
      - id: product_name
        label: "Product Name"
        type: short_text
      - id: main_idea
        label: "What's your product's main idea?"
        type: paragraph
        placeholder: "E.g., Trafella helps travelers build personalized itineraries using AI."
      - id: initialized
        label: "Have you already initialized the app and entered the root folder?"
        type: boolean

  - id: collect_features
    title: "🌟 What features does your product offer?"
    type: checklist
    min_items: 3
    fields:
      - id: key_features
        label: "List at least 3 key features"
        type: list
        placeholder: "E.g., Itinerary Generator, Save/Share Plans, Embedding-Based Personalization"

  - id: collect_users
    title: "👤 Who are your users?"
    type: form
    fields:
      - id: user_segments
        label: "List your primary customer segments"
        type: list
        placeholder: "E.g., Solo Travelers, Digital Nomads, Family Planners"
      - id: use_cases
        label: "Describe 1 or more use cases"
        type: paragraph
        placeholder: "E.g., 'Plan a 3-day trip to Seoul based on preferences'"

  - id: collect_tech_stack
    title: "🧱 What tech stack will you use?"
    type: form
    fields:
      - id: app_framework
        label: "Application Framework (e.g., FastAPI, Rails)"
        type: short_text
      - id: database
        label: "Database System"
        type: short_text
      - id: js_framework
        label: "JS Framework (e.g., Vue, React)"
        type: short_text
      - id: css_framework
        label: "CSS Framework"
        type: short_text
      - id: hosting
        label: "Application Hosting (e.g., Vercel, Fly.io)"
        type: short_text

  - id: confirm_summary
    title: "✅ Review & Confirm"
    type: summary
    content: |
      You're about to generate product scaffolding with:
      - Name: {{product_name}}
      - Idea: {{main_idea}}
      - Features: {{key_features.join(', ')}}
      - Target Users: {{user_segments.join(', ')}}
      - Use Cases: {{use_cases}}
      - Tech Stack: {{app_framework}}, {{database}}, {{js_framework}}, {{css_framework}}, {{hosting}}

  - id: generate_files
    title: "📁 Generate Product Structure"
    type: action
    action: |
      Create the following files:
      - `.agent-os/product/mission.md`
      - `.agent-os/product/mission-lite.md`
      - `.agent-os/product/tech-stack.md`
      - `.agent-os/product/roadmap.md`
      - `.agent-os/product/decisions.md`
      
      Each file should include structured content using the fields collected above.

  - id: success
    title: "🎉 All set!"
    type: message
    content: |
      Your product plan is ready. You can now run `create-spec` or `analyze-product` next.
