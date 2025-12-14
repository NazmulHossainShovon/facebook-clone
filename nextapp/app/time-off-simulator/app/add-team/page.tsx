'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

const AddTeam = () => {
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId.trim()) {
      setMessage('Team ID is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Call backend API to create a new team
      const response = await apiClient.post('/api/time-off/teams', {
        teamId,
      });

      if (response.status === 201) {
        setMessage('Team created successfully!');
        setTeamId('');

        // Optionally redirect to another page after a delay
        setTimeout(() => {
          router.push('/time-off-simulator/app'); // Redirect to time-off simulator page
        }, 1500);
      } else {
        setMessage(response.data.msg || 'Failed to create team');
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.msg || 'An error occurred while creating the team'
      );
      console.error('Error creating team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Team</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="teamId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Team ID
          </label>
          <input
            type="text"
            id="teamId"
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter unique team identifier"
          />
          <p className="mt-1 text-sm text-gray-500">
            A unique identifier for the team (e.g., "engineering", "marketing",
            "sales")
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {message}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h2 className="font-medium text-blue-800 mb-2">Note:</h2>
        <p className="text-sm text-blue-700">
          This form creates a team with an empty members field. Team members
          will be added separately on another form.
        </p>
      </div>
    </div>
  );
};

export default AddTeam;
