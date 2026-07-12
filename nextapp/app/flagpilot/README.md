# Flagpilot (MVP) — Feature Summary

NOTE: The feature list below is written for non-technical users.

This page explains, in simple terms, what the Flagpilot feature does and how you can use it.

## What this does (plain language)

- Groups (called "Projects")
  - You can create named Projects to keep related settings together (for example, "Website" or "Mobile App").

- Environments (stages for your work)
  - Inside a Project you can create Environments such as "Development" or "Production".
  - Each Environment has a unique secret code (an API key) that developers use to connect an app to these settings.

- Feature Flags (on/off switches and small settings)
  - Create a flag to turn a feature on or off for an app (for example, "Show New Landing Page").
  - A flag has a name and a short key (used by apps). It can be a simple on/off toggle, or it can hold a small text value (for things like percentage, color, or a message).
  - Flags are stored per Environment, so you can turn a feature on in Development without affecting Production.

- Public endpoint for apps
  - Apps can fetch the list of flags for a specific Environment using its secret code. This lets apps know which features should be enabled.

## Examples (what you'll see)

- Turn a feature on or off: flip a switch in the web UI and the connected app can immediately read the new state.
- Change a setting value: store a short text value for a flag (e.g., "20" for a discount) that the app reads and uses.

## For developers (short reference)

If you need the technical details or want to extend this feature, the implementation lives in these files:

- Backend models: `backend/src/models/flagpilotProjectModel.ts`, `flagpilotEnvironmentModel.ts`, `flagpilotFeatureFlagModel.ts`
- Backend router: `backend/src/routers/flagpilotRouter.ts` (mounted at `app.use('/api/flagpilot', ...)`)
- Frontend pages: `nextapp/app/flagpilot/layout.tsx`, `page.tsx`, `[projectId]/environments/page.tsx`, `env/[environmentId]/page.tsx`

## Want UI improvements?

I can add friendly forms and dialogs for creating and editing Projects, Environments, and Flags. Tell me which one to build first.
