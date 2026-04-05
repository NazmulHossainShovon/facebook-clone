import React from 'react';

interface RoleFieldProps {
  role: string;
  onChange: (role: string) => void;
  error?: string;
}

const RoleField: React.FC<RoleFieldProps> = ({ role, onChange, error }) => {
  return (
    <div>
      <label
        htmlFor="role"
        className="block text-sm font-medium text-neutral-700 mb-1"
      >
        Role
      </label>
      <input
        type="text"
        id="role"
        value={role}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500 ${
          error ? 'border-status-error' : 'border-neutral-300'
        }`}
        placeholder="Enter role"
        required
      />
      <p className="mt-1 text-sm text-neutral-500">
        Job role or position of the team member
      </p>
      {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
    </div>
  );
};

export default RoleField;
