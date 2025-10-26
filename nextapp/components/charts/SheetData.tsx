'use client';

import React, { useState, useEffect } from 'react';

import ChartTypeSelector from './ChartTypeSelector';
import {
  detectNumericColumns,
  createSingleNumericChart,
  createMultipleNumericChart,
  createNonNumericChart,
  createPieChart,
  createBubbleChart,
  createScatterLineAreaChart,
  createHistogram,
  createBoxPlot,
  createViolinPlot,
  createFunnelChart,
  createLine3DChart,
  createGenericChart,
} from '../../utils/chartHelpers';

export interface SheetRow {
  [key: string]: string;
}

interface ChartTypeOption {
  label: string;
  value: string;
  category: string;
}

// Define available chart types
const chartTypes: ChartTypeOption[] = [
  // Basic Charts
  { label: 'Bar Chart', value: 'bar', category: 'Basic' },
  { label: 'Pie Chart', value: 'pie', category: 'Basic' },
  { label: 'Scatter Plot', value: 'scatter', category: 'Basic' },
  { label: 'Line Chart', value: 'line', category: 'Basic' },
  { label: 'Bubble Chart', value: 'bubble', category: 'Basic' },
  { label: 'Area Chart', value: 'area', category: 'Basic' },
  { label: 'Histogram', value: 'histogram', category: 'Basic' },
  { label: 'Box Plot', value: 'box', category: 'Basic' },
  { label: 'Violin Plot', value: 'violin', category: 'Basic' },
  { label: 'Funnel Chart', value: 'funnel', category: 'Basic' },
  { label: 'Waterfall Chart', value: 'waterfall', category: 'Basic' },

  // Statistical Charts
  { label: '2D Histogram', value: 'histogram2d', category: 'Statistical' },
  { label: '2D Contour', value: 'histogram2dcontour', category: 'Statistical' },
  { label: 'Contour Plot', value: 'contour', category: 'Statistical' },
  { label: 'Heatmap', value: 'heatmap', category: 'Statistical' },
  { label: 'Density Heatmap', value: 'densitymapbox', category: 'Statistical' },

  // Financial Charts
  { label: 'Candlestick Chart', value: 'candlestick', category: 'Financial' },
  { label: 'OHLC Chart', value: 'ohlc', category: 'Financial' },

  // Geographical Charts
  { label: 'Scatter Geo', value: 'scattergeo', category: 'Geographical' },
  { label: 'Choropleth Map', value: 'choropleth', category: 'Geographical' },
  { label: 'Scatter Mapbox', value: 'scattermapbox', category: 'Geographical' },
  {
    label: 'Choropleth Mapbox',
    value: 'choroplethmapbox',
    category: 'Geographical',
  },

  // 3D Charts
  { label: '3D Scatter', value: 'scatter3d', category: '3D' },
  { label: '3D Surface', value: 'surface', category: '3D' },
  { label: '3D Line', value: 'line3d', category: '3D' }, // Placeholder value that will be handled in the logic
  { label: '3D Mesh', value: 'mesh3d', category: '3D' },
  { label: '3D Contour', value: 'contour3d', category: '3D' },
  { label: '3D Volume', value: 'volume', category: '3D' },
  { label: '3D Isosurface', value: 'isosurface', category: '3D' },

  // Specialty Charts
  { label: 'Sunburst', value: 'sunburst', category: 'Specialty' },
  { label: 'Treemap', value: 'treemap', category: 'Specialty' },
  { label: 'Icicle', value: 'icicle', category: 'Specialty' },
  { label: 'Sankey', value: 'sankey', category: 'Specialty' },
  { label: 'Parallel Coordinates', value: 'parcoords', category: 'Specialty' },
  { label: 'Parallel Categories', value: 'parcats', category: 'Specialty' },
  { label: 'Table', value: 'table', category: 'Specialty' },
  { label: 'Carpet', value: 'carpet', category: 'Specialty' },
  { label: 'Scatter Carpet', value: 'scattercarpet', category: 'Specialty' },
  { label: 'Funnel Area', value: 'funnelarea', category: 'Specialty' },
  { label: 'Image', value: 'image', category: 'Specialty' },
  { label: 'Gauge', value: 'indicator', category: 'Specialty' },

  // WebGL Charts
  { label: 'Scatter GL', value: 'scattergl', category: 'WebGL' },
  { label: 'Heatmap GL', value: 'heatmapgl', category: 'WebGL' },
  { label: 'Contour GL', value: 'contourgl', category: 'WebGL' },
  { label: 'Point Cloud', value: 'pointcloud', category: 'WebGL' },
];

const SheetData = () => {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [PlotComponent, setPlotComponent] = useState<any>(null);
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [selectedNumericColumn, setSelectedNumericColumn] = useState<string>('');

  // Sample Google Sheet URL - replace with your actual sheet
  // For this to work, the sheet must be published to web
  // To publish: File > Publish to Web > Select "Comma-separated values (.csv)" > Publish
  // Fetch only A1:C4 range
  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/1ltA9siijVSDkTE3fzB3UaWHO7dotBIrGH4R9wI_Qyqw/export?format=csv&gid=0&range=A1%3AC4';

  useEffect(() => {
    const fetchData = async () => {
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

    // Dynamically import Plot component to avoid SSR issues
    import('react-plotly.js').then(PlotModule => {
      setPlotComponent(() => PlotModule.default);
    });

    fetchData();
  }, []);

  // Calculate numeric columns based on current data
  const numericColumns = data.length > 0 ? detectNumericColumns(Object.keys(data[0]), data[0]) : [];

  // Set default selected numeric column when chart type is violin and data is loaded
  useEffect(() => {
    if (selectedChartType === 'violin' && numericColumns.length > 0 && !selectedNumericColumn) {
      setSelectedNumericColumn(numericColumns[0]);
    }
  }, [selectedChartType, numericColumns, selectedNumericColumn]);

  // Simple CSV parser
  const parseCSV = (csvText: string): SheetRow[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map(header => header.trim().replace(/^"|"$/g, ''));
    const result: SheetRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      const obj: SheetRow = {};

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
      const columnsToUse = selectedNumericColumn ? [selectedNumericColumn] : 
                           numericColumns.length > 0 ? [numericColumns[0]] : numericColumns;
      return createViolinPlot(headers, data, columnsToUse);
    } else if (['funnel', 'funnelarea'].includes(selectedChartType)) {
      return createFunnelChart(
        headers,
        data,
        numericColumns,
        selectedChartType
      );
    } else if (selectedChartType === 'line3d') {
      return createLine3DChart(headers, data, numericColumns);
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
      <h2 className="text-xl font-bold mb-4">Sheet Data (A1:C4)</h2>

      {/* Chart type selector */}
      <ChartTypeSelector
        selectedChartType={selectedChartType}
        setSelectedChartType={setSelectedChartType}
        chartTypes={chartTypes}
        numericColumns={numericColumns}
        selectedNumericColumn={selectedNumericColumn}
        setSelectedNumericColumn={setSelectedNumericColumn}
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

      {/* Display the table data as well */}
      {data.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              {Object.keys(data[0]).map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-2 text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {Object.values(row).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default SheetData;
