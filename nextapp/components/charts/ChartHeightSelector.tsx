import React from 'react';

interface ChartHeightSelectorProps {
  chartHeight: string;
  setChartHeight: (height: string) => void;
}

const ChartHeightSelector: React.FC<ChartHeightSelectorProps> = ({
  chartHeight,
  setChartHeight,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Chart Height (px)
      </label>
      <input
        type="number"
        value={chartHeight}
        onChange={(e) => setChartHeight(e.target.value)}
        min="100"
        max="2000"
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter height in pixels"
      />
    </div>
  );
};

export default ChartHeightSelector;