'use client';

import React from 'react';

interface TeamMember {
  employeeId: string;
  name: string;
  role: string;
  availability: {
    date: string;
    available: boolean;
  }[];
}

interface Props {
  data: {
    team: {
      members: TeamMember[];
    };
    gaps: {
      date: string;
      availableCount: number;
      isGap: boolean;
      totalMembers: number;
    }[];
  };
}

export const Visualization: React.FC<Props> = ({ data }) => {
  if (!data || !data.team || !data.gaps) {
    return <div>No simulation data available</div>;
  }

  // Get unique dates and sort them
  const dates = [...new Set(data.gaps.map(g => new Date(g.date).toISOString().split('T')[0]))].sort();

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Get availability for a specific date and employee
  const getEmployeeAvailability = (member: any, dateStr: string) => {
    const avail = member.availability.find((a: any) => 
      new Date(a.date).toISOString().split('T')[0] === dateStr
    );
    return avail || { available: true }; // Default to available if no record exists
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            {data.team.members.map((member: TeamMember) => (
              <th key={member.employeeId} className="border border-gray-300 px-4 py-2 text-sm">
                {member.name}
              </th>
            ))}
            <th className="border border-gray-300 px-4 py-2">Coverage</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((dateStr) => {
            const gapInfo = data.gaps.find(g => 
              new Date(g.date).toISOString().split('T')[0] === dateStr
            );
            
            return (
              <tr key={dateStr}>
                <td className="border border-gray-300 px-4 py-2 text-sm">
                  {formatDate(dateStr)}
                </td>
                {data.team.members.map((member: TeamMember) => {
                  const availability = getEmployeeAvailability(member, dateStr);
                  const isUnavailable = !availability.available;
                  
                  return (
                    <td 
                      key={`${member.employeeId}-${dateStr}`} 
                      className={`border border-gray-300 px-4 py-2 text-center text-sm ${
                        isUnavailable ? 'bg-red-200' : 'bg-green-100'
                      }`}
                    >
                      {isUnavailable ? 'OFF' : 'A'}
                    </td>
                  );
                })}
                <td 
                  className={`border border-gray-300 px-4 py-2 text-center text-sm font-semibold ${
                    gapInfo?.isGap ? 'bg-yellow-200' : 'bg-green-100'
                  }`}
                >
                  {gapInfo ? `${gapInfo.availableCount}/${gapInfo.totalMembers}` : 'N/A'}
                  {gapInfo?.isGap && <span className="block text-xs">GAP</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="mt-6 text-sm">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-green-100 border border-gray-300 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-red-200 border border-gray-300 mr-2"></div>
          <span>On Leave (Unavailable)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-200 border border-gray-300 mr-2"></div>
          <span>Coverage Gap (less than 50% availability)</span>
        </div>
      </div>
    </div>
  );
};