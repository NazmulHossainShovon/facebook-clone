'use client';

import { useState, useEffect, useContext } from 'react';
import { Store } from '../lib/store';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Visualization } from './Visualization';
import apiClient from '../lib/api-client';

const TimeOffSimulator = () => {
  const { state: { userInfo } } = useContext(Store);
  const [team, setTeam] = useState<any>(null);
  const [leave, setLeave] = useState({
    employeeId: '',
    startDate: '',
    endDate: ''
  });
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const teamId = 'team-1';

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get(`/api/time-off/teams/${teamId}`);
      setTeam(response.data);
    } catch (err: any) {
      console.error('Error fetching team:', err);
      setError(err.response?.data?.msg || 'Failed to load team data');

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

    try {
      const response = await apiClient.post(`/api/time-off/teams/${teamId}/simulate-leave`, leave);
      setSimulation(response.data);
    } catch (err: any) {
      console.error('Error simulating leave:', err);
      setError(err.response?.data?.msg || 'Failed to simulate leave');

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
        <h1 className="text-3xl font-bold mb-6">Time-Off Impact Simulator</h1>
        
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
                Employee
              </label>
              <select
                value={leave.employeeId}
                onChange={(e) => setLeave({...leave, employeeId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select an employee</option>
                {team?.members?.map((member: any) => (
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
                  onChange={(e) => setLeave({...leave, startDate: e.target.value})}
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
                  onChange={(e) => setLeave({...leave, endDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Simulating...' : 'Simulate Leave Impact'}
            </button>
          </form>
        </div>
        
        {simulation && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
            <Visualization data={simulation} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TimeOffSimulator;