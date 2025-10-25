import React from 'react';

interface ViolinPlotOptionsProps {
  numericColumns: string[];
  selectedNumericColumn: string;
  setSelectedNumericColumn: (value: string) => void;
}

const ViolinPlotOptions: React.FC<ViolinPlotOptionsProps> = ({
  numericColumns,
  selectedNumericColumn,
  setSelectedNumericColumn,
}) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Numeric Column for Violin Plot:
      </label>
      <select
        value={selectedNumericColumn}
        onChange={e => setSelectedNumericColumn(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {numericColumns.map((col, index) => (
          <option key={index} value={col}>
            {col}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ViolinPlotOptions;