'use client';

import React, { useState, useEffect } from 'react';
import useViolinPlot from '../../hooks/charts/useViolinPlot';

import ChartTypeSelector from './ChartTypeSelector';
import SheetUrlInput from './SheetUrlInput';
import {
  detectNumericColumns,
  createSingleNumericChart,
  createMultipleNumericChart,
  createNonNumericChart,
  createPieChart,
  createBubbleChart,
  createScatterLineAreaChart,
} from '../../utils/charts/chartHelpers';
import { chartTypes } from '../../constants/charts/chartTypes';
import {
  createBoxPlot,
  createFunnelChart,
  createHistogram,
  createViolinPlot,
} from 'utils/charts/chartHelpers2';
import {
  createGenericChart,
  createHistogram2DContour,
  createLine3DChart,
} from 'utils/charts/chartHelpers1';

// Simple CSV parser (copied from useSheetData hook to avoid importing it)
const parseCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(',')
    .map(header => header.trim().replace(/^"|"$/g, ''));
  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    const obj: any = {};

    for (let j = 0; j < headers.length; j++) {
      // Remove quotes from beginning and end if they exist
      const value = currentLine[j]?.trim().replace(/^"|"$/g, '') || '';
      obj[headers[j]] = value;
    }

    result.push(obj);
  }

  return result;
};

const SheetData = () => {
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [selectedNumericColumn, setSelectedNumericColumn] =
    useState<string>('');
  const [selectedNonNumericColumn, setSelectedNonNumericColumn] =
    useState<string>('');
  const [xAxisTitle, setXAxisTitle] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [PlotComponent, setPlotComponent] = useState<any>(null);

  // Initialize with a sample URL
  useEffect(() => {
    setSheetUrl(
      'https://docs.google.com/spreadsheets/d/1Z4M4UY6dykUeLG5-Cf4vQWfDaLE1numAFXgePSrPkDs/export?format=csv&gid=0&range=A1%3AD4'
    );
  }, []);

  // Dynamically import Plot component to avoid SSR issues
  useEffect(() => {
    import('react-plotly.js').then(PlotModule => {
      setPlotComponent(() => PlotModule.default);
    });
  }, []);

  // Calculate numeric and non-numeric columns based on current data
  const allHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns =
    data.length > 0 ? detectNumericColumns(allHeaders, data[0]) : [];
  const nonNumericColumns = allHeaders.filter(
    header => !numericColumns.includes(header)
  );

  // Use custom hook for violin plot logic
  useViolinPlot({
    selectedChartType,
    numericColumns,
    selectedNumericColumn,
    setSelectedNumericColumn,
  });

  // Function to fetch data from the sheet URL
  const fetchSheetData = async () => {
    if (!sheetUrl) {
      setError('Please enter a valid sheet URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For Google Sheets, we can fetch as CSV or JSON
      // Using CSV format here and converting to JSON
      const response = await fetch(sheetUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      setData(parsedData);
    } catch (err) {
      console.error('Error fetching sheet data:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data based on selected chart type
  const prepareChartData = (): { chartData: any[]; layout: any } => {
    if (data.length === 0) return { chartData: [], layout: {} };

    const headers = Object.keys(data[0]);
    if (headers.length < 2) return { chartData: [], layout: {} };

    // Try to detect numeric columns for charting
    const firstDataRow = data[0];
    const numericColumns = detectNumericColumns(headers, firstDataRow);

    // Create chart based on selected type
    if (selectedChartType === 'bar') {
      if (numericColumns.length === 1) {
        // Single numeric column - use first non-numeric as x-axis
        return createSingleNumericChart(headers, numericColumns, data);
      } else if (numericColumns.length > 1) {
        // Multiple numeric columns - create grouped bar chart
        return createMultipleNumericChart(headers, numericColumns, data);
      } else {
        // No numeric columns, create a simple chart with text data
        return createNonNumericChart(data);
      }
    } else if (selectedChartType === 'pie') {
      return createPieChart(headers, data, numericColumns);
    } else if (selectedChartType === 'bubble') {
      return createBubbleChart(headers, data, numericColumns);
    } else if (
      selectedChartType === 'scatter' ||
      selectedChartType === 'line' ||
      selectedChartType === 'area'
    ) {
      return createScatterLineAreaChart(
        headers,
        data,
        numericColumns,
        selectedChartType
      );
    } else if (selectedChartType === 'histogram') {
      return createHistogram(headers, data, numericColumns);
    } else if (selectedChartType === 'box') {
      return createBoxPlot(headers, data, numericColumns);
    } else if (selectedChartType === 'violin') {
      // If a specific numeric column is selected, use only that column
      // Otherwise, if there are numeric columns, default to the first one
      const columnsToUse = selectedNumericColumn
        ? [selectedNumericColumn]
        : numericColumns.length > 0
          ? [numericColumns[0]]
          : numericColumns;
      return createViolinPlot(headers, data, columnsToUse, xAxisTitle);
    } else if (['funnel', 'funnelarea'].includes(selectedChartType)) {
      return createFunnelChart(
        headers,
        data,
        numericColumns,
        selectedChartType,
        selectedNumericColumn,
        selectedNonNumericColumn
      );
    } else if (selectedChartType === 'line3d') {
      return createLine3DChart(headers, data, numericColumns);
    } else if (selectedChartType === 'histogram2dcontour') {
      return createHistogram2DContour(
        headers,
        data,
        numericColumns,
        selectedNumericColumn,
        selectedNonNumericColumn
      );
    } else {
      // For other chart types, create a generic chart based on available data
      return createGenericChart(
        headers,
        data,
        numericColumns,
        selectedChartType
      );
    }
  };

  if (loading) {
    return <div>Loading sheet data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const { chartData, layout } = prepareChartData();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sheet Data Chart Generator</h2>

      {/* Input for sheet URL */}
      <SheetUrlInput
        sheetUrl={sheetUrl}
        setSheetUrl={setSheetUrl}
        loading={loading}
        onFetchData={fetchSheetData}
      />

      {/* Chart type selector */}
      <ChartTypeSelector
        selectedChartType={selectedChartType}
        setSelectedChartType={setSelectedChartType}
        chartTypes={chartTypes}
        numericColumns={numericColumns}
        nonNumericColumns={nonNumericColumns}
        allHeaders={allHeaders}
        selectedNumericColumn={selectedNumericColumn}
        setSelectedNumericColumn={setSelectedNumericColumn}
        selectedNonNumericColumn={selectedNonNumericColumn}
        setSelectedNonNumericColumn={setSelectedNonNumericColumn}
        xAxisTitle={xAxisTitle}
        setXAxisTitle={setXAxisTitle}
      />

      {/* Display the chart if we have chart data and Plot component is loaded */}
      {chartData.length > 0 && PlotComponent && (
        <div className="mb-8">
          <PlotComponent
            data={chartData}
            layout={layout}
            config={{ displayModeBar: true, responsive: true }}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
      )}
    </div>
  );
};

export default SheetData;
