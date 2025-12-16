'use client';

import { useState, useEffect, useContext } from 'react';
import { Store } from '../../lib/store';
import ProtectedRoute from '../../../components/ProtectedRoute';
import apiClient from '../../lib/api-client';

const TimeOffSimulator = () => {
  const {
    state: { userInfo },
  } = useContext(Store);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [leave, setLeave] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllTeams();
  }, []);

  const fetchAllTeams = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/api/time-off/teams');
      setAllTeams(response.data);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.msg || 'Failed to load teams');

      // Handle authentication error
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get(`/api/time-off/teams/${teamId}`);
      setTeamMembers(response.data.members || []);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError(err.response?.data?.msg || 'Failed to load team members');

      // Handle authentication error
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedTeam) {
      setError('Please select a team');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/time-off/teams/${selectedTeam}/submit-leave`,
        {
          employeeId: leave.employeeId,
          startDate: leave.startDate,
          endDate: leave.endDate,
        }
      );

      // Process the response if needed
      console.log('Leave submission response:', response.data);

      // Show success message
      alert('Leave request submitted successfully!');
      setLeave({ employeeId: '', startDate: '', endDate: '' });
    } catch (err: any) {
      console.error('Error submitting employee leave:', err);
      setError(err.response?.data?.msg || 'Failed to submit employee leave');

      // Handle authentication error
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo.name) {
    return <div>Redirecting...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit Leave Request</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={e => {
                  const teamId = e.target.value;
                  setSelectedTeam(teamId);
                  if (teamId) {
                    fetchTeamMembers(teamId);
                  } else {
                    setTeamMembers([]);
                    setLeave({ ...leave, employeeId: '' });
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a team</option>
                {allTeams.map((team: any) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={leave.employeeId}
                onChange={e =>
                  setLeave({ ...leave, employeeId: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                required
                disabled={!selectedTeam}
              >
                <option value="">Select an employee</option>
                {teamMembers.map((member: any) => (
                  <option key={member.employeeId} value={member.employeeId}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={leave.startDate}
                  onChange={e =>
                    setLeave({ ...leave, startDate: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={leave.endDate}
                  onChange={e =>
                    setLeave({ ...leave, endDate: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedTeam}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TimeOffSimulator;
