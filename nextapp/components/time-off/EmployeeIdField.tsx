import React from 'react';

interface EmployeeIdFieldProps {
  employeeId: string;
  onChange: (employeeId: string) => void;
  error?: string;
}

const EmployeeIdField: React.FC<EmployeeIdFieldProps> = ({
  employeeId,
  onChange,
  error,
}) => {
  return (
    <div>
      <label
        htmlFor="employeeId"
        className="block text-sm font-medium text-neutral-700 mb-1"
      >
        Employee ID
      </label>
      <input
        type="text"
        id="employeeId"
        value={employeeId}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500 ${
          error ? 'border-status-error' : 'border-neutral-300'
        }`}
        placeholder="Enter employee identifier"
        required
      />
      <p className="mt-1 text-sm text-neutral-500">
        Unique identifier for the employee (e.g., "emp-001", "john-doe")
      </p>
      {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
    </div>
  );
};

export default EmployeeIdField;
