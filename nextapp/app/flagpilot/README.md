# Flagpilot (MVP v2)

This Flagpilot app now uses an optimization-first architecture based on implicit anonymous identity and multi-armed bandit traffic allocation.

## What changed

- Project-level API key auth
- Variant-based flags (not simple boolean/string toggles)
- Goal auto-registration at evaluate time
- Sticky assignment by `flag + anon user + goalEvent`
- Conversion tracking with deduplication
- Dynamic traffic splitting via Thompson Sampling

## Backend API surface

- `POST /api/flagpilot/projects`
- `GET /api/flagpilot/projects`
- `GET /api/flagpilot/projects/:id`
- `POST /api/flagpilot/flags`
- `GET /api/flagpilot/flags?projectId=...`
- `GET /api/flagpilot/flags/:id`
- `PUT /api/flagpilot/flags/:id`
- `POST /api/flagpilot/v1/evaluate`
- `POST /api/flagpilot/v1/track`

## Data model summary

- `FlagpilotProject`: `name`, `orgId`, `apiKey`
- `FlagpilotFeatureFlag`: `project`, `key`, `status`, `trackedGoals`, `minImpressionsBeforeOptimization`, `variants[]`
- `FlagpilotEvaluationLog`: sticky exposure logs with `converted` and 30-day TTL

## Dashboard screens

- `/flagpilot`: Projects list and creation
- `/flagpilot/[projectId]/environments`: Project detail, API key, and flag management
- `/flagpilot/env/[environmentId]`: Flag detail page with traffic and conversion metrics

## SDK package

See `sdk/flagpilot/react` for evaluate/track based client and React hooks.
