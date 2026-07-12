# Flagpilot React SDK

Simple React SDK to fetch flags from a Flagpilot backend.

Quick start

1. Install:

```bash
npm install flagpilot-react
```

2. Wrap your app:

```tsx
import { FlagpilotProvider } from 'flagpilot-react'

<FlagpilotProvider environmentKey={process.env.NEXT_PUBLIC_FLAGPILOT_KEY}>
  <App />
</FlagpilotProvider>
```

3. Use the `useFlag` hook:

```tsx
import { useFlag } from 'flagpilot-react'

function MyFeature() {
  const { enabled, value } = useFlag('show_new_landing')
  return enabled ? <NewLanding value={value} /> : <OldLanding />
}
```

Build/publish

Run `npm run build` to compile to `dist/`, then publish from the package folder.
