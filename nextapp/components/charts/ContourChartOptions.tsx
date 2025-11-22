import React from 'react';

interface ContourChartOptionsProps {
  numericColumns: string[];
  selectedNumericColumn?: string;
  setSelectedNumericColumn: (value: string) => void;
}

const ContourChartOptions: React.FC<ContourChartOptionsProps> = ({
  numericColumns,
  selectedNumericColumn,
  setSelectedNumericColumn,
}) => {
  return (
    <div className="md:col-span-7">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Data Range
      </label>
      <input
        type="text"
        list="numericColumns"
        value={selectedNumericColumn || ''}
        onChange={e => setSelectedNumericColumn(e.target.value)}
        placeholder="Enter cell range (e.g., A1:B10)"
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default ContourChartOptions;
