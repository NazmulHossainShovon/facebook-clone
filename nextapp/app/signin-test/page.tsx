'use client';

import React, { useState } from 'react';
import { FlagpilotProvider, useFlag, useFlagpilot } from 'flagpilot-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const { trackGoal, identify } = useFlagpilot();

  // Flagpilot SDK: Flag name "signin_button_text", default "Sign In"
  const { value: buttonText, isLoading } = useFlag<string>(
    'signin_button_text',
    'signin_button_clicked',
    'Sign In'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Identify user to resolve anonymous ID -> user_id
    const simulatedUserId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await identify(simulatedUserId);

    // 2. Track conversion goal when button is clicked / form is submitted
    await trackGoal('signin_button_clicked');
    setMessage(`Signed in as ${simulatedUserId}! Identity merged & goal "signin_button_clicked" tracked.`);
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white border rounded-xl shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-center">Sign In</h2>

      {message && (
        <p className="text-xs text-center font-medium p-2 bg-green-50 text-green-700 rounded border border-green-200">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition"
        >
          {isLoading ? 'Loading...' : buttonText}
        </button>
      </form>
    </div>
  );
}

export default function SignInTestPage() {
  const apiKey = ''; // Insert your Flagpilot API Key here
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/flagpilot/v1`;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <FlagpilotProvider apiKey={apiKey} baseUrl={baseUrl}>
        <SignInForm />
      </FlagpilotProvider>
    </div>
  );
}
