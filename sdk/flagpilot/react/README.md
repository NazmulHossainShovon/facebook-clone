# Flagpilot React SDK

React SDK for Flagpilot evaluation and goal tracking APIs.

## Install

```bash
npm install flagpilot-react
```

## Provider setup

```tsx
import { FlagpilotProvider } from "flagpilot-react";

<FlagpilotProvider
  apiKey={process.env.NEXT_PUBLIC_FLAGPILOT_API_KEY as string}
  baseUrl={process.env.NEXT_PUBLIC_FLAGPILOT_BASE_URL}
>
  <App />
</FlagpilotProvider>
```

Default `baseUrl` is `http://localhost:4000/api/flagpilot/v1`.

## Evaluate a flag

```tsx
import { useFlag } from "flagpilot-react";

function CheckoutButton() {
  const { value: config, isLoading } = useFlag(
    "new_checkout_flow",
    "purchase_completed",
    { btnColor: "blue", text: "Checkout" }
  );

  if (isLoading) return <button>Checkout</button>;

  return <button style={{ background: config.btnColor }}>{config.text}</button>;
}
```

`useFlag` performs `POST /evaluate` and persists anonymous identity automatically.

## Track conversion goals

```tsx
import { useTrackGoal } from "flagpilot-react";

function PurchaseComplete() {
  const trackGoal = useTrackGoal();

  const onSuccess = async () => {
    await trackGoal("purchase_completed");
  };

  return <button onClick={onSuccess}>Complete Purchase</button>;
}
```

`useTrackGoal` calls `POST /track` and relies on the same anonymous identity used during evaluation.

## Low-level client

```tsx
import { AutoFlagClient } from "flagpilot-react";

const client = new AutoFlagClient({
  apiKey: "fp_proj_...",
  baseUrl: "https://api.example.com/api/flagpilot/v1",
});

const value = await client.getValue("new_checkout_flow", "purchase_completed", false);
await client.trackGoal("purchase_completed");
```

## Build

Run `npm run build` to compile to `dist/`.
