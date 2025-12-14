import React from 'react';

interface NameFieldProps {
  name: string;
  onChange: (name: string) => void;
  error?: string;
}

const NameField: React.FC<NameFieldProps> = ({ name, onChange, error }) => {
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
        Name
      </label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Enter full name"
        required
      />
      <p className="mt-1 text-sm text-gray-500">
        Full name of the team member
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default NameField;