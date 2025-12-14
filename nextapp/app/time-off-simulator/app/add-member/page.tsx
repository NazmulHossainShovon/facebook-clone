'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

const AddMember = () => {
  const [teamId, setTeamId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const router = useRouter();

  // Fetch available teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get('/api/time-off/teams');
        if (response.data && Array.isArray(response.data)) {
          setAvailableTeams(response.data.map((team: any) => team.teamId));
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId || !employeeId || !name || !role) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Call backend API to add a new member to the team
      const response = await apiClient.post(
        `/api/time-off/teams/${teamId}/members`,
        {
          employeeId,
          name,
          role,
          leaveDates: [], // Start with empty leave dates array
        }
      );

      if (response.status === 200 || response.status === 201) {
        setMessage('Team member added successfully!');

        // Reset the form
        setEmployeeId('');
        setName('');
        setRole('');

        // Optionally redirect or stay on the page
        // setTimeout(() => {
        //   router.push('/time-off-simulator'); // Redirect to time-off simulator page
        // }, 1500);
      } else {
        setMessage(response.data.msg || 'Failed to add team member');
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.msg ||
          'An error occurred while adding the team member'
      );
      console.error('Error adding team member:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Team Member</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="teamId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Team
          </label>
          <select
            id="teamId"
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select a team</option>
            {availableTeams.map(teamId => (
              <option key={teamId} value={teamId}>
                {teamId}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select the team to add the member to
          </p>
        </div>

        <div>
          <label
            htmlFor="employeeId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Employee ID
          </label>
          <input
            type="text"
            id="employeeId"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter employee identifier"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Unique identifier for the employee (e.g., "emp-001", "john-doe")
          </p>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter full name"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Full name of the team member
          </p>
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <input
            type="text"
            id="role"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter role"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Job role or position of the team member
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Member'}
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
          This form adds a member to an existing team. Leave dates can be added
          separately.
        </p>
      </div>
    </div>
  );
};

export default AddMember;
