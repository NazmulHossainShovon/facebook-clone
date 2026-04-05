'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../app/lib/api-client';

interface TeamSelectorProps {
  teamId: string;
  onChange: (teamId: string) => void;
  error?: string;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  teamId,
  onChange,
  error,
}) => {
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get('/api/time-off/teams');
        if (response.data && Array.isArray(response.data)) {
          setAvailableTeams(response.data.map((team: any) => team.teamId));
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm">
        Loading teams...
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="teamId"
        className="block text-sm font-medium text-neutral-700 mb-1"
      >
        Team
      </label>
      <select
        id="teamId"
        value={teamId}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500 ${
          error ? 'border-status-error' : 'border-neutral-300'
        }`}
        required
      >
        <option value="">Select a team</option>
        {availableTeams.map(teamId => (
          <option key={teamId} value={teamId}>
            {teamId}
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-neutral-500">
        Select the team to add the member to
      </p>
      {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
    </div>
  );
};

export default TeamSelector;
