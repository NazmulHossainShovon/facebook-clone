'use client';

import React from 'react';
import ViolinPlotOptions from './ViolinPlotOptions';
import { ChartTypeOption } from '../../constants/charts/chartTypes';

interface ChartTypeSelectorProps {
  selectedChartType: string;
  setSelectedChartType: (value: string) => void;
  chartTypes: ChartTypeOption[];
  numericColumns?: string[];
  nonNumericColumns?: string[]; // Added this prop
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
  nonNumericColumns = [],
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
          numericColumns.length > 0 &&
          setSelectedNumericColumn && (
            <div className="md:col-span-7">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Numeric Column (X-axis/Values):
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

                {setSelectedNonNumericColumn && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Labels Column (Y-axis/Stages):
                      </label>
                      <select
                        value={selectedNonNumericColumn || ''}
                        onChange={e =>
                          setSelectedNonNumericColumn(e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {nonNumericColumns.length > 0 &&
                          nonNumericColumns.map((col, index) => (
                            <option key={index} value={col}>
                              {col}
                            </option>
                          ))}
                        {numericColumns.length > 1 &&
                          numericColumns
                            .filter(col => col !== selectedNumericColumn)
                            .map((col, index) => (
                              <option key={`numeric-${index}`} value={col}>
                                {col} (Numeric)
                              </option>
                            ))}
                      </select>
                    </div>
                  )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
