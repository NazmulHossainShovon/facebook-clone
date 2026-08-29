# Flagpilot

Flagpilot is an intelligent, self-optimizing feature testing platform that helps you deliver the best possible user experience and maximize your conversion rates effortlessly.

## Key Features

* **Smart A/B/C Testing & Auto-Optimization**: Let Flagpilot do the heavy lifting. Our system learns from user behavior in real-time, automatically directing more traffic to your highest-performing designs (variants) to maximize sign-ups, sales, or engagement without any manual intervention.
* **Customizable Optimization Thresholds**: Decide exactly when Flagpilot's automatic optimizer starts. Set a target number of initial visits (e.g., 100 impressions) before the system starts shifting traffic, ensuring you gather enough initial baseline data.
* **Multi-Option Testing**: Go beyond simple on/off switches. Test multiple design ideas, text versions, or layouts simultaneously to discover what truly resonates with your audience.
* **Rich Configurable Variants**: Test more than just plain text. Define variations using rich formats (like JSON objects, colors, or structured data) to test complex features, layout parameters, or UI configurations seamlessly.
* **Flexible Experiment Statuses**: Maintain total control over your tests. Easily launch, pause, resume, or archive experiments at any time with a single click.
* **Instant Setup with Secure Keys**: Connect your apps securely using project-level keys, keeping your integration simple, robust, and safe.
* **Zero-Setup Goal Discovery**: Simply track what matters. Your conversion goals are automatically detected and registered the moment they happen, eliminating tedious dashboard configurations.
* **Consistent User Experiences**: Ensure your visitors enjoy a seamless journey. Once a visitor sees a specific version of your feature, Flagpilot remembers and continues to show them that exact version on every return visit.
* **Accurate Success Tracking**: Get clean, reliable metrics. Duplicate conversion events are automatically filtered out so you can trust your performance data.

## Interactive Dashboards

* **Project Center**: Easily organize and overview all your ongoing projects in a single, clean workspace.
* **Experiment Dashboard**: Monitor active tests, create new variations, configure optimization thresholds, and check real-time traffic splits for your projects.
* **Live Performance Insights**: Analyze interactive visual charts. See real-time conversion rates, traffic distribution, and detailed performance metrics to know exactly which options are winning.

## React SDK Integration Guide

Integrating Flagpilot into your React or Next.js application is simple and takes just two steps:

### 1. Set Up the Provider
Wrap your root application component with the `FlagpilotProvider` and supply your secure project API key:

```tsx
import { FlagpilotProvider } from "flagpilot-react";

export default function RootLayout({ children }) {
  return (
    <FlagpilotProvider 
      apiKey="YOUR_PROJECT_API_KEY" 
      baseUrl="http://localhost:4000/api/flagpilot/v1"
    >
      {children}
    </FlagpilotProvider>
  );
}
```

### 2. Evaluate Flags & Track Conversion Goals
Use custom React hooks to instantly evaluate dynamic variations (booleans, strings, or complex JSON configurations) and track successful actions/goals:

```tsx
import { useFlag, useTrackGoal } from "flagpilot-react";

export function PromoBanner() {
  // Retrieve variant configuration with automatic visitor session assignment
  const { value: config, isLoading } = useFlag(
    "promo_banner_test",   // Flag Key
    "banner_clicked",      // Goal Event Key
    { title: "Standard Offer", theme: "gray" } // Fallback Default
  );

  const trackGoal = useTrackGoal();

  if (isLoading) return null;

  return (
    <div className={`p-4 rounded border ${config.theme === "gray" ? "bg-gray-100" : "bg-blue-100"}`}>
      <h2>{config.title}</h2>
      <button 
        onClick={() => trackGoal("banner_clicked")}
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
      >
        Claim Offer
      </button>
    </div>
  );
}
```
