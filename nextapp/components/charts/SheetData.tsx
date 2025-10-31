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
} from '../../utils/charts/chartHelpers2';
import {
  createGenericChart,
  createHistogram2DContour,
  createLine3DChart,
  createContourChart,
} from '../../utils/charts/chartHelpers1';
import {
  fetchSheetDataByType,
  combineFunnelData,
} from '../../utils/charts/chartHelpers3';

const SheetData = () => {
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [selectedNumericColumn, setSelectedNumericColumn] =
    useState<string>('');
  const [selectedNonNumericColumn, setSelectedNonNumericColumn] =
    useState<string>('');
  const [xAxisTitle, setXAxisTitle] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [oneDArray1, setOneDArray1] = useState<any[]>([]);
  const [twoDArray1, setTwoDArray1] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [PlotComponent, setPlotComponent] = useState<any>(null);

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

      // Fetch data based on chart type
      const result = await fetchSheetDataByType(
        sheetUrl,
        selectedChartType,
        selectedNumericColumn,
        selectedNonNumericColumn
      );

      setData(result.data);
      setOneDArray1(result.oneDArray1 || []);
      setTwoDArray1(result.twoDArray1 || []);
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
    // if (headers.length < 2) return { chartData: [], layout: {} };

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
      // For funnel charts, if we have the special oneDArray1 data from range values, use it
      if (selectedChartType === 'funnel' && oneDArray1.length > 0) {
        // Use the helper function to combine funnel data
        const combinedData = combineFunnelData(
          data,
          oneDArray1,
          selectedNumericColumn,
          selectedNonNumericColumn
        );
        const funnelHeaders = [selectedNumericColumn, selectedNonNumericColumn];
        return createFunnelChart(
          funnelHeaders,
          combinedData,
          [selectedNumericColumn], // numeric columns
          selectedChartType,
          selectedNumericColumn,
          selectedNonNumericColumn,
          oneDArray1,
          data // Pass original data state as additional parameter
        );
      } else {
        return createFunnelChart(
          headers,
          data,
          numericColumns,
          selectedChartType,
          selectedNumericColumn,
          selectedNonNumericColumn,
          oneDArray1,
          data // Pass original data state as additional parameter (same as the second parameter in this case)
        );
      }
    } else if (selectedChartType === 'line3d') {
      return createLine3DChart(headers, data, numericColumns);
    } else if (selectedChartType === 'contour') {
      return createContourChart(
        headers,
        data,
        numericColumns,
        selectedNumericColumn,
        twoDArray1
      );
    } else if (selectedChartType === 'histogram2dcontour') {
      return createHistogram2DContour(
        headers,
        data,
        numericColumns,
        selectedNumericColumn,
        selectedNonNumericColumn,
        oneDArray1
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
