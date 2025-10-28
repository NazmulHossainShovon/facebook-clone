'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // npm install papaparse for robust CSV parsing
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

// Helper: Convert column letter (A, B, ..., AA) to 0-indexed number
const colLetterToNumber = (letter: string): number => {
  let num = 0;
  for (let i = 0; i < letter.length; i++) {
    num = num * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return num - 1; // 0-indexed (A=0, B=1, ..., Z=25, AA=26)
};

const googleApiKey = 'AIzaSyCIrfb-dVFQDVwPHIBJKMcSnvfTPkhjT34';

// Helper: Extract sheet ID from Google Sheets URL
const extractSheetId = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

/**
 * Fetches values from a specified range in a Google Sheet (published as CSV)
 * and returns a 1D array of cell values (row-major order: left-to-right, top-to-bottom).
 * Preserves original types: numbers as Number, text as string, empties as ''.
 *
 * @param {string} sheetUrl - Full Google Sheets URL (e.g., 'https://docs.google.com/spreadsheets/d/1abc123xyz/edit')
 * @param {string} range - A1-style range (e.g., 'A1:A4', 'A1:C1', 'A1:B3')
 * @returns {Promise<(string | number)[]>} - 1D array of cell values preserving types
 * @throws Error on invalid URL, range, fetch failure, or out-of-bounds range
 */
const getSheetRangeValues = async (
  sheetUrl: string,
  range: string,
  apiKey: string
) => {
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) {
    throw new Error(
      'Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/{ID}/edit'
    );
  }
  if (!apiKey) {
    throw new Error('API key is required for Google Sheets API access');
  }
  if (!range) {
    throw new Error('Range is required (e.g., "A1:B3")');
  }

  // Construct API URL (uses first sheet by default; append !SheetName to range for specific tabs)
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API fetch failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const responseData = await response.json();

    // Extract 2D values (assumes ROWS majorDimension; API defaults to this for A1 ranges)
    const values2D = responseData.values || [];
    if (!Array.isArray(values2D)) {
      throw new Error('Invalid API response: expected 2D array');
    }

    // Flatten and type-preserve (API returns strings; detect numbers)
    const toValue = (cell: any) => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell).trim();
      const num = Number(str);
      // If it parses to number and stringifies back to original (no leading zeros loss, etc.)
      return !isNaN(num) && String(num) === str ? num : str;
    };

    const values = values2D.flat().map(toValue);

    return values;
  } catch (error) {
    console.error('Error fetching/parsing sheet via API:', error);
    throw error;
  }
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

      // Check if the sheet URL is a Google Sheets URL
      if (sheetUrl.includes('docs.google.com/spreadsheets')) {
        // Use the new getSheetRangeValues function for Google Sheets
        if (
          selectedNumericColumn &&
          selectedNumericColumn.trim() &&
          selectedNumericColumn.match(/^[A-Z]+\d*:[A-Z]+\d*$/)
        ) {
          // If a valid range is provided, use getSheetRangeValues
          const values = await getSheetRangeValues(
            sheetUrl,
            selectedNumericColumn,
            googleApiKey
          );
          console.log(values);
          // Convert the 1D array of values to the required format for setData
          // Parse the range to determine if it's a single column or single row
          const [start, end] = selectedNumericColumn.split(':');
          const startCol = start.match(/[A-Z]+/)?.[0];
          const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
          const endCol = end.match(/[A-Z]+/)?.[0];
          const endRow = parseInt(end.match(/\d+/)?.[0] || '1');

          let parsedData: any[] = [];

          // Check if it's a single column (same column letter, different rows)
          if (startCol === endCol && startRow !== endRow) {
            // Single column - create an array with one object containing an array of values
            const colName = startCol || 'Column';
            parsedData = [{ [colName]: values }]; // Format: [{ 'A': [val1, val2, val3...] }]
          }
          // Check if it's a single row (same row number, different columns)
          else if (startRow === endRow && startCol !== endCol) {
            // Single row - create an object with column names as keys and values
            const row: any = {};
            for (let i = 0; i < values.length; i++) {
              const colName = String.fromCharCode('A'.charCodeAt(0) + i);
              row[colName] = values[i];
            }
            parsedData = [row]; // Format: [{ 'A': val1, 'B': val2, 'C': val3... }]
          } else {
            // Multiple rows and columns - format as multiple objects with generic property names
            const colCount = endCol
              ? colLetterToNumber(endCol) - colLetterToNumber(startCol!) + 1
              : 1;
            const rowCount = endRow - startRow + 1;

            for (let r = 0; r < rowCount; r++) {
              const row: any = {};
              for (let c = 0; c < colCount; c++) {
                const colName = String.fromCharCode('A'.charCodeAt(0) + c);
                const index = r * colCount + c;
                row[colName] = values[index];
              }
              parsedData.push(row);
            }
          }

          setData(parsedData);
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
