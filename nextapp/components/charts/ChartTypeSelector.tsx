'use client';

import React from 'react';
import ViolinPlotOptions from './ViolinPlotOptions';
import FunnelChartOptions from './FunnelChartOptions';
import ContourChartOptions from './ContourChartOptions';
import HeatmapChartOptions from './HeatmapChartOptions';
import Scatter3DChartOptions from './Scatter3DChartOptions';
import SurfaceChartOptions from './SurfaceChartOptions';
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
  range3?: string;
  setRange3?: (value: string) => void;
  xAxisTitle?: string;
  setXAxisTitle?: (value: string) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedChartType,
  setSelectedChartType,
  chartTypes,
  numericColumns = [],
  nonNumericColumns = [],
  allHeaders = [],
  selectedNumericColumn,
  setSelectedNumericColumn,
  selectedNonNumericColumn,
  setSelectedNonNumericColumn,
  range3,
  setRange3,
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

        {selectedChartType === 'violin' && setSelectedNumericColumn && (
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
          selectedChartType === 'histogram2dcontour') &&
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

        {selectedChartType === 'contour' && setSelectedNumericColumn && (
          <ContourChartOptions
            numericColumns={numericColumns}
            selectedNumericColumn={selectedNumericColumn}
            setSelectedNumericColumn={setSelectedNumericColumn}
          />
        )}
        
        {selectedChartType === 'heatmap' && setSelectedNumericColumn && (
          <HeatmapChartOptions
            numericColumns={numericColumns}
            selectedNumericColumn={selectedNumericColumn}
            setSelectedNumericColumn={setSelectedNumericColumn}
          />
        )}

        {selectedChartType === 'scatter3d' && 
          setSelectedNumericColumn && 
          setSelectedNonNumericColumn && 
          setRange3 && (
          <Scatter3DChartOptions
            allHeaders={allHeaders}
            selectedNumericColumn={selectedNumericColumn || ''}
            setSelectedNumericColumn={setSelectedNumericColumn}
            selectedNonNumericColumn={selectedNonNumericColumn || ''}
            setSelectedNonNumericColumn={setSelectedNonNumericColumn}
            range3={range3 || ''}
            setRange3={setRange3}
          />
        )}

        {selectedChartType === 'surface' && 
          setSelectedNumericColumn && 
          setSelectedNonNumericColumn && 
          setRange3 && (
          <SurfaceChartOptions
            allHeaders={allHeaders}
            selectedNumericColumn={selectedNumericColumn || ''}
            setSelectedNumericColumn={setSelectedNumericColumn}
            selectedNonNumericColumn={selectedNonNumericColumn || ''}
            setSelectedNonNumericColumn={setSelectedNonNumericColumn}
            range3={range3 || ''}
            setRange3={setRange3}
          />
        )}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
