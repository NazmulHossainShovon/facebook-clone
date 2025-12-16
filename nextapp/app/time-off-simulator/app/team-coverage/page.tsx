'use client';

import { useState, useEffect, useContext } from 'react';
import { Store } from '../../../lib/store';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import apiClient from '../../../lib/api-client';

export default function TeamCoverage() {
  const {
    state: { userInfo },
  } = useContext(Store);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [coverageData, setCoverageData] = useState<any[]>([]);
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

  const handleShowCoverage = async () => {
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get(`/api/time-off/teams/${selectedTeam}/coverage`);
      setCoverageData(response.data.coverage);
    } catch (err: any) {
      console.error('Error fetching coverage data:', err);
      setError(err.response?.data?.msg || 'Failed to fetch coverage data');

      // Handle authentication error
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!userInfo.name) {
    return <div>Redirecting...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Team Coverage</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">Select a team</option>
              {allTeams.map((team: any) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamId}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleShowCoverage}
            disabled={loading || !selectedTeam}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Show Coverage'}
          </button>
        </div>

        {coverageData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Coverage for Next 10 Days</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {coverageData.map((day: any, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg text-center ${day.isGap ? 'bg-red-200' : 'bg-green-200'}`}
                >
                  <div className="font-medium">{formatDate(new Date(day.date))}</div>
                  <div className="text-sm mt-1">
                    {day.availableCount} of {day.totalMembers} available
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}