'use client';

import React from 'react';

interface ChartTypeOption {
  label: string;
  value: string;
  category: string;
}

interface ChartTypeSelectorProps {
  selectedChartType: string;
  setSelectedChartType: (value: string) => void;
  chartTypes: ChartTypeOption[];
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedChartType,
  setSelectedChartType,
  chartTypes,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Chart Type:
      </label>
      <select
        value={selectedChartType}
        onChange={e => setSelectedChartType(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {chartTypes.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label} ({option.category})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChartTypeSelector;