'use client';

import React from 'react';
import ViolinPlotOptions from './ViolinPlotOptions';
import FunnelChartOptions from './FunnelChartOptions';
import { ChartTypeOption } from '../../constants/charts/chartTypes';

interface ChartTypeSelectorProps {
  selectedChartType: string;
  setSelectedChartType: (value: string) => void;
  chartTypes: ChartTypeOption[];
  numericColumns?: string[];
  nonNumericColumns?: string[]; // Added this prop
  allHeaders?: string[]; // Added this prop to show all headers as options
  selectedNumericColumn?: string;
  setSelectedNumericColumn?: (value: string) => void;
  selectedNonNumericColumn?: string;
  setSelectedNonNumericColumn?: (value: string) => void;
  xAxisTitle?: string;
  setXAxisTitle?: (value: string) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedChartType,
  setSelectedChartType,
  chartTypes,
  numericColumns = [],
  allHeaders = [],
  selectedNumericColumn,
  setSelectedNumericColumn,
  selectedNonNumericColumn,
  setSelectedNonNumericColumn,
  xAxisTitle,
  setXAxisTitle,
}) => {
  return (
    <div className="mb-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chart Type
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

        {selectedChartType === 'violin' &&
          numericColumns.length > 0 &&
          setSelectedNumericColumn && (
            <div className="md:col-span-7">
              <ViolinPlotOptions
                numericColumns={numericColumns}
                selectedNumericColumn={selectedNumericColumn || ''}
                setSelectedNumericColumn={setSelectedNumericColumn}
                xAxisTitle={xAxisTitle}
                setXAxisTitle={setXAxisTitle}
              />
            </div>
          )}

        {(selectedChartType === 'funnel' ||
          selectedChartType === 'funnelarea') &&
          allHeaders.length > 0 &&
          setSelectedNumericColumn &&
          setSelectedNonNumericColumn && (
            <FunnelChartOptions
              allHeaders={allHeaders}
              selectedNumericColumn={selectedNumericColumn}
              setSelectedNumericColumn={setSelectedNumericColumn}
              selectedNonNumericColumn={selectedNonNumericColumn}
              setSelectedNonNumericColumn={setSelectedNonNumericColumn}
            />
          )}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
