# dbtsearch.org - Initial Cursor Prompts

## Context block to paste first
Use this as the setup context before giving Cursor a task:
text
```
I'm building dbtsearch.org, a Minnesota-first directory for certified DBT providers. The MVP is a simple website-first product focused on helping users find providers with current availability. Providers should be able to log in and easily update availability, ideally by flipping a simple on/off switch. Some providers have multiple locations, so the data model needs to support one provider with multiple locations. The stack is Craft CMS 5.9 as a headless backend, Vue on the frontend, GraphQL between them, Tailwind CSS, Vite, DDEV for local development, and Cloudways for hosting. I want to keep the MVP very simple and avoid overengineering.
```

## Prompt 1 - Help me define the MVP cleanly text v
Based on this project context, help me write a concise MVP definition for dbtsearch.org. Include:
1. what the product is
2. who it is for
3. the core problem it solves
4. what must be included in MVP
5. what should be explicitly excluded from MVP for now
Keep the answer practical and biased toward shipping quickly.

## Prompt 2 - Recommend the best content/data model
I need help designing the Craft CMS content model for dbtsearch.org.
Constraints:
- One provider may have multiple locations
- Many providers probably have only one location
- Availability may differ by location
- Public search results should be easy for users to understand
- Provider representatives should be able to update availability simply
Recommend the best MVP data model. Explain:
1. what the parent entity should be
2. what the child entity should be
3. where availability should live
4. how Craft sections/entry types/relations could be structured
5. tradeoffs of alternative approaches

Keep it practical for Craft CMS 5.9.

## Prompt 3 - Generate the Craft field architecture
Based on the recommended data model for dbtsearch.org, propose a concrete Craft CMS field architecture for MVP.
Include:
- sections or entry types
- field names
- field types
- relationships between providers, locations, and users
- which fields are public-facing
- which fields are admin-only
Return the answer in a structured format that I can use as an implementation checklist.

## Prompt 4 - Define user flows
Help me define the core user flows for dbtsearch.org MVP.

I want flows for:
1. first-time public visitor landing on the splash page
2. public user going to search results
3. returning user bypassing the splash page via cookie logic
4. provider representative logging in
5. provider representative updating availability for one location
6. provider representative updating availability for multiple locations

For each flow, keep it short and practical and identify any product decisions I still need to make.

## Prompt 5 - Plan the GraphQL API shape
Given this stack:
- Craft CMS 5.9
- headless setup
- Vue frontend
- GraphQL API
Propose an MVP GraphQL design for dbtsearch.org. I need:
1. the main queries for public provider search
2. the fields the frontend should request
3. how to filter for providers with availability
4. how to sort by most recently updated availability
5. what mutations or update patterns might be needed for provider-side availability updates
Keep this focused on a simple MVP, not a fully generalized architecture.

## Prompt 6 - Break implementation into phases
Create a phased implementation plan for dbtsearch.org MVP using this stack:
- Craft CMS 5.9
- Vue
- GraphQL
- Tailwind
- Vite
- DDEV
- Cloudways
Break the work into phases such as:
- product decisions
- data modeling
- Craft setup
- API setup
- frontend pages
- provider update flow
- launch prep
For each phase, list the most important tasks and dependencies. Optimize for momentum and simplicity.

## Prompt 7 - Help me decide backend Ul vs custom frontend for providers
I need to decide whether provider representatives should manage their updates in:
1. the native Craft backend or
2. a simple custom Vue frontend
Evaluate both options for this specific MVP. My priorities are:
- low build complexity
- simple user experience
- low maintenance
- quick launch
- easv availabilitv updates

## Prompt 8 - Generate implementation-ready tasks
Turn this dbtsearch.org MVP concept into a prioritized engineering task list.
Please:
- group tasks by phase
- mark what is required for MVP
- mark what can wait
- keep tasks small enough to execute with Al coding assistance
- highlight any blockers or unknowns
Output the result as a checklist.
Prompt 9 - Review my plan for overengineering risk
Review this dbtsearch.org MVP concept and identify where I may be overengineering.
Specifically look for:
- features that should be postponed
-technical complexity that is unnecessary for MVP
- decisions that can be simplified
- assumptions that should be validated first
Be opinionated and optimize for a fast first release.

## Prompt 10 - Create a strong starter prompt for the project
Using everything above, write me a high-quality reusable Cursor starter prompt for this project.
The prompt should:
- explain the product clearly
- explain the MVP constraints clearly
- mention the stack
- tell Cursor to prefer simple, maintainable solutions
- discourage overengineering
- encourage phased implementation
- make it easier to work task by task
I want this to be the prompt reuse at the start of new Cursor chats for dbtsearch.org.