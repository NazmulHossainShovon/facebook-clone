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
import { getSheetRangeValues } from 'lib/actions/getSheetRangeValues';

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

      // Special handling for funnel charts
      if (selectedChartType === 'funnel') {
        // Check if both selected columns are valid ranges
        if (
          selectedNumericColumn &&
          selectedNumericColumn.trim() &&
          selectedNumericColumn.match(/^[A-Z]+\d*:[A-Z]+\d*$/) &&
          selectedNonNumericColumn &&
          selectedNonNumericColumn.trim() &&
          selectedNonNumericColumn.match(/^[A-Z]+\d*:[A-Z]+\d*$/)
        ) {
          // Call getSheetRangeValues twice for funnel chart
          const [numericValues, nonNumericValues] = await Promise.all([
            getSheetRangeValues(sheetUrl, selectedNumericColumn),
            getSheetRangeValues(sheetUrl, selectedNonNumericColumn),
          ]);

          setData(numericValues);
          setOneDArray1(nonNumericValues);
        } else {
          // If ranges are not valid, fallback to original approach
          // Extract the spreadsheet ID from the URL
          const sheetIdMatch = sheetUrl.match(
            /spreadsheets\/d\/([a-zA-Z0-9-_]+)/
          );
          if (!sheetIdMatch) {
            throw new Error(
              'Invalid Google Sheets URL. Could not extract sheet ID.'
            );
          }

          const sheetId = sheetIdMatch[1];

          // Construct the proper Google Sheets CSV export URL
          const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

          const response = await fetch(csvUrl);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data: ${response.status} ${response.statusText}`
            );
          }

          const csvText = await response.text();
          let parsedData = parseCSV(csvText);

          setData(parsedData);
        }
      } else {
        // Check if the sheet URL is a Google Sheets URL
        if (sheetUrl.includes('docs.google.com/spreadsheets')) {
          // Use the new getSheetRangeValues server action for Google Sheets
          if (
            selectedNumericColumn &&
            selectedNumericColumn.trim() &&
            selectedNumericColumn.match(/^[A-Z]+\d*:[A-Z]+\d*$/)
          ) {
            // If a valid range is provided, use getSheetRangeValues server action
            const values = await getSheetRangeValues(
              sheetUrl,
              selectedNumericColumn
            );

            setData(values);
          } else {
            // If no range is specified, proceed with the current approach
            // Extract the spreadsheet ID from the URL
            const sheetIdMatch = sheetUrl.match(
              /spreadsheets\/d\/([a-zA-Z0-9-_]+)/
            );
            if (!sheetIdMatch) {
              throw new Error(
                'Invalid Google Sheets URL. Could not extract sheet ID.'
              );
            }

            const sheetId = sheetIdMatch[1];

            // Construct the proper Google Sheets CSV export URL
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

            const response = await fetch(csvUrl);

            if (!response.ok) {
              throw new Error(
                `Failed to fetch data: ${response.status} ${response.statusText}`
              );
            }

            const csvText = await response.text();
            let parsedData = parseCSV(csvText);

            setData(parsedData);
          }
        } else {
          // For other types of sheet URLs (e.g., direct CSV files)
          let fetchUrl = sheetUrl;

          const response = await fetch(fetchUrl);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data: ${response.status} ${response.statusText}`
            );
          }

          const csvText = await response.text();
          let parsedData = parseCSV(csvText);

          setData(parsedData);
        }
      }
    } catch (err) {
      console.error('Error fetching sheet data:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

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
        // Create a combined array for funnel chart from both data sets
        const combinedData = [];
        const maxLength = Math.max(data.length, oneDArray1.length);
        for (let i = 0; i < maxLength; i++) {
          const obj: any = {};
          if (data[i] && typeof data[i] === 'object' && data[i][0]) {
            obj[selectedNumericColumn] = data[i][0];
          } else if (data[i] !== undefined) {
            obj[selectedNumericColumn] = data[i];
          }

          if (
            oneDArray1[i] &&
            typeof oneDArray1[i] === 'object' &&
            oneDArray1[i][0]
          ) {
            obj[selectedNonNumericColumn] = oneDArray1[i][0];
          } else if (oneDArray1[i] !== undefined) {
            obj[selectedNonNumericColumn] = oneDArray1[i];
          }

          combinedData.push(obj);
        }
        const funnelHeaders = [selectedNumericColumn, selectedNonNumericColumn];
        return createFunnelChart(
          funnelHeaders,
          combinedData,
          [selectedNumericColumn], // numeric columns
          selectedChartType,
          selectedNumericColumn,
          selectedNonNumericColumn
        );
      } else {
        return createFunnelChart(
          headers,
          data,
          numericColumns,
          selectedChartType,
          selectedNumericColumn,
          selectedNonNumericColumn
        );
      }
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
  console.log(data, oneDArray1);

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
