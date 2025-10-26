import React, { useState } from 'react';

interface ViolinPlotOptionsProps {
  numericColumns: string[];
  selectedNumericColumn: string;
  setSelectedNumericColumn: (value: string) => void;
  xAxisTitle?: string;
  setXAxisTitle?: (value: string) => void;
}

const ViolinPlotOptions: React.FC<ViolinPlotOptionsProps> = ({
  numericColumns,
  selectedNumericColumn,
  setSelectedNumericColumn,
  xAxisTitle,
  setXAxisTitle,
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div>
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

      {setXAxisTitle && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X-axis Title:
          </label>
          <input
            type="text"
            value={xAxisTitle || ''}
            onChange={e => setXAxisTitle(e.target.value)}
            placeholder="Enter custom x-axis title"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};

export default ViolinPlotOptions;