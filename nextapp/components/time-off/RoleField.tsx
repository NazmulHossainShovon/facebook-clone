import React from 'react';

interface RoleFieldProps {
  role: string;
  onChange: (role: string) => void;
  error?: string;
}

const RoleField: React.FC<RoleFieldProps> = ({ role, onChange, error }) => {
  return (
    <div>
      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
        Role
      </label>
      <input
        type="text"
        id="role"
        value={role}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Enter role"
        required
      />
      <p className="mt-1 text-sm text-gray-500">
        Job role or position of the team member
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default RoleField;