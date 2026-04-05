import React from 'react';

interface NameFieldProps {
  name: string;
  onChange: (name: string) => void;
  error?: string;
}

const NameField: React.FC<NameFieldProps> = ({ name, onChange, error }) => {
  return (
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-neutral-700 mb-1"
      >
        Name
      </label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500 ${
          error ? 'border-status-error' : 'border-neutral-300'
        }`}
        placeholder="Enter full name"
        required
      />
      <p className="mt-1 text-sm text-neutral-500">
        Full name of the team member
      </p>
      {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
    </div>
  );
};

export default NameField;
