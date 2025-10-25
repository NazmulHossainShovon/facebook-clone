'use client';

import React, { useState, useEffect } from 'react';

import {
  detectNumericColumns,
  createSingleNumericChart,
  createMultipleNumericChart,
  createNonNumericChart,
} from '../utils/chartHelpers';

export interface SheetRow {
  [key: string]: string;
}

interface ChartTypeOption {
  label: string;
  value: string;
  category: string;
}

const SheetData = () => {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [PlotComponent, setPlotComponent] = useState<any>(null);
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');

  // Sample Google Sheet URL - replace with your actual sheet
  // For this to work, the sheet must be published to web
  // To publish: File > Publish to Web > Select "Comma-separated values (.csv)" > Publish
  // Fetch only A1:C4 range
  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/1ltA9siijVSDkTE3fzB3UaWHO7dotBIrGH4R9wI_Qyqw/export?format=csv&gid=0&range=A1%3AC4';

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
    { label: 'Choropleth Mapbox', value: 'choroplethmapbox', category: 'Geographical' },
    
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
    let chartData: any[] = [];
    let layout: any = {};

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
      if (numericColumns.length === 1) {
        const numericCol = numericColumns[0];
        const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
        const labelsCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];

        const labels: string[] = data.map(row => row[labelsCol]);
        const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        chartData = [
          {
            values: values,
            labels: labels,
            type: 'pie',
          },
        ];

        layout = {
          title: `Pie Chart: ${numericCol}`,
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric columns or multiple numeric columns, create a simple pie chart
        return createNonNumericChart(data);
      }
    } else if (selectedChartType === 'bubble') {
      if (numericColumns.length >= 3) {
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];
        const sizeCol = numericColumns[2];
        
        const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
        const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
        const sizeValues: number[] = data.map(row => parseFloat(row[sizeCol]) || 1);
        
        chartData = [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'markers',
            marker: { 
              size: sizeValues,
              sizemode: 'diameter',
              sizeref: 2 * Math.max(...sizeValues) / (100 * Math.min(1, Math.max(...sizeValues) / 100)),
              color: '#3b82f6' 
            },
            name: 'Bubble Chart',
          },
        ];
        
        layout = {
          title: `Bubble Chart: ${xCol} vs ${yCol} vs ${sizeCol}`,
          xaxis: { title: xCol },
          yaxis: { title: yCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else if (numericColumns.length >= 2) {
        // Use the second column as size if we only have 2 numeric columns
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];
        
        const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
        const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
        const sizeValues: number[] = data.map(row => Math.abs(parseFloat(row[yCol]) || 10) + 5); // Use y values as bubble size
        
        chartData = [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'markers',
            marker: { 
              size: sizeValues,
              sizemode: 'diameter',
              sizeref: 2 * Math.max(...sizeValues) / (100 * Math.min(1, Math.max(...sizeValues) / 100)),
              color: '#3b82f6' 
            },
            name: 'Bubble Chart',
          },
        ];
        
        layout = {
          title: `Bubble Chart: ${xCol} vs ${yCol}`,
          xaxis: { title: xCol },
          yaxis: { title: yCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else if (numericColumns.length === 1) {
        // Use index as x and y values as size if we only have 1 numeric column
        const numericCol = numericColumns[0];
        
        const xValues: number[] = data.map((_, i) => i);
        const yValues: number[] = data.map((_, i) => i * 0.5); // Simple y progression
        const sizeValues: number[] = data.map(row => Math.abs(parseFloat(row[numericCol]) || 10) + 5);
        
        chartData = [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'markers',
            marker: { 
              size: sizeValues,
              sizemode: 'diameter',
              sizeref: 2 * Math.max(...sizeValues) / (100 * Math.min(1, Math.max(...sizeValues) / 100)),
              color: '#3b82f6' 
            },
            name: 'Bubble Chart',
          },
        ];
        
        layout = {
          title: `Bubble Chart: ${numericCol}`,
          xaxis: { title: 'Index' },
          yaxis: { title: 'Index' },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric columns - fallback to non-numeric chart
        return createNonNumericChart(data);
      }
    } else if (selectedChartType === 'scatter' || selectedChartType === 'line' || selectedChartType === 'area') {
      if (numericColumns.length >= 2) {
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];
        
        const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
        const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);

        let mode = 'markers';
        let fill = '';
        let name = 'Scatter Plot';
        
        if (selectedChartType === 'line') {
          mode = 'lines';
          name = 'Line Chart';
        } else if (selectedChartType === 'area') {
          mode = 'lines';
          fill = 'tozeroy';
          name = 'Area Chart';
        }

        chartData = [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: mode,
            fill: fill,
            line: mode === 'lines' ? { color: '#3b82f6' } : undefined,
            marker: mode === 'markers' ? { size: 10, color: '#3b82f6' } : undefined,
            name: name,
          },
        ];

        layout = {
          title: `${name}: ${xCol} vs ${yCol}`,
          xaxis: { title: xCol },
          yaxis: { title: yCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else if (numericColumns.length === 1) {
        // Create a chart with index as x-axis
        const numericCol = numericColumns[0];
        
        const xValues: number[] = data.map((_, i) => i);
        const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        let mode = 'lines';
        let fill = '';
        let name = selectedChartType === 'line' ? 'Line Chart' : 
                  selectedChartType === 'area' ? 'Area Chart' : 
                  'Scatter Plot'; // Default to scatter plot
        
        if (selectedChartType === 'area') {
          fill = 'tozeroy';
        } else if (selectedChartType === 'scatter') {
          mode = 'markers';
        }

        chartData = [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: mode,
            fill: fill,
            line: mode === 'lines' ? { color: '#3b82f6' } : undefined,
            marker: mode === 'markers' ? { size: 10, color: '#3b82f6' } : undefined,
            name: name,
          },
        ];

        layout = {
          title: `${name}: ${numericCol}`,
          xaxis: { title: 'Index' },
          yaxis: { title: numericCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric columns
        return createNonNumericChart(data);
      }
    } else if (selectedChartType === 'histogram') {
      if (numericColumns.length >= 1) {
        const numericCol = numericColumns[0];
        const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        chartData = [
          {
            x: values,
            type: 'histogram',
          },
        ];

        layout = {
          title: `Histogram: ${numericCol}`,
          xaxis: { title: numericCol },
          yaxis: { title: 'Count' },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric data, use all rows as equal distribution
        return createNonNumericChart(data);
      }
    } else if (['box', 'violin'].includes(selectedChartType)) {
      if (numericColumns.length >= 1) {
        const numericCol = numericColumns[0];
        const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        chartData = [
          {
            y: values,
            type: selectedChartType as any,
          },
        ];

        layout = {
          title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Plot: ${numericCol}`,
          yaxis: { title: numericCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric data fallback
        return createNonNumericChart(data);
      }
    } else if (['funnel', 'funnelarea'].includes(selectedChartType)) {
      if (numericColumns.length === 1) {
        const numericCol = numericColumns[0];
        const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
        const labelsCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];

        const labels: string[] = data.map(row => row[labelsCol]);
        const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        chartData = [
          {
            y: values,
            x: labels,
            type: selectedChartType as any,
          },
        ];

        layout = {
          title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart: ${numericCol}`,
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric columns or multiple numeric columns, create a simple chart
        return createNonNumericChart(data);
      }
    } else if (selectedChartType === 'line3d') {
      // 3D line chart needs at least 3 numeric columns (x, y, z)
      if (numericColumns.length >= 3) {
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];
        const zCol = numericColumns[2];
        
        const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
        const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
        const zValues: number[] = data.map(row => parseFloat(row[zCol]) || 0);

        chartData = [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'scatter3d',
            mode: 'lines',
            line: { color: '#3b82f6' },
          },
        ];

        layout = {
          title: `3D Line Chart: ${xCol} vs ${yCol} vs ${zCol}`,
          scene: {
            xaxis: { title: xCol },
            yaxis: { title: yCol },
            zaxis: { title: zCol }
          },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else if (numericColumns.length >= 2) {
        // Use index as third dimension if we only have 2 numeric columns
        const xCol = numericColumns[0];
        const yCol = numericColumns[1];
        
        const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
        const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
        const zValues: number[] = data.map((_, i) => i);

        chartData = [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'scatter3d',
            mode: 'lines',
            line: { color: '#3b82f6' },
          },
        ];

        layout = {
          title: `3D Line Chart: ${xCol} vs ${yCol}`,
          scene: {
            xaxis: { title: xCol },
            yaxis: { title: yCol },
            zaxis: { title: 'Index' }
          },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else if (numericColumns.length === 1) {
        // Use index for y and z if we only have 1 numeric column
        const numericCol = numericColumns[0];
        
        const xValues: number[] = data.map((_, i) => i);
        const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);
        const zValues: number[] = data.map((_, i) => i * 0.5); // Simple z progression

        chartData = [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'scatter3d',
            mode: 'lines',
            line: { color: '#3b82f6' },
          },
        ];

        layout = {
          title: `3D Line Chart: ${numericCol}`,
          scene: {
            xaxis: { title: 'Index' },
            yaxis: { title: numericCol },
            zaxis: { title: 'Z (Index)' }
          },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric columns - fallback to non-numeric chart
        return createNonNumericChart(data);
      }
    } else {
      // For other chart types, create a generic chart based on available data
      if (numericColumns.length === 1) {
        const numericCol = numericColumns[0];
        const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
        const xCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];

        const xValues: (string | number)[] = data.map(row => row[xCol]);
        const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        chartData = [
          {
            x: xValues,
            y: yValues,
            type: selectedChartType as any,
          },
        ];

        layout = {
          title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}: ${numericCol} by ${xCol}`,
          xaxis: { title: xCol },
          yaxis: { title: numericCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else if (numericColumns.length > 1) {
        // Multiple numeric columns - create a basic chart with first numeric column as y-axis
        const xCol = headers[0]; // Use first column as x-axis
        const xValues: (string | number)[] = data.map(row => row[xCol]);
        const numericCol = numericColumns[0];
        const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

        chartData = [
          {
            x: xValues,
            y: yValues,
            type: selectedChartType as any,
          },
        ];

        layout = {
          title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}: ${numericCol}`,
          xaxis: { title: xCol },
          yaxis: { title: numericCol },
          margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
        };
      } else {
        // No numeric columns - use only chart types that make sense with non-numeric data
        if (['bar', 'pie', 'funnel', 'funnelarea', 'sunburst', 'treemap', 'icicle'].includes(selectedChartType)) {
          const values: number[] = Array(data.length).fill(1); // Equal distribution
          const labels: string[] = data.map((row, i) => `Row ${i + 1}`);

          chartData = [
            {
              values: values,
              labels: labels,
              type: selectedChartType as any,
            },
          ];

          layout = {
            title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}: Data Distribution`,
            margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
          };
        } else {
          // For chart types that don't work well with non-numeric data, fall back to a basic chart
          return createNonNumericChart(data);
        }
      }
    }

    return { chartData, layout };
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
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Chart Type:
        </label>
        <select
          value={selectedChartType}
          onChange={(e) => setSelectedChartType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {chartTypes.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label} ({option.category})
            </option>
          ))}
        </select>
      </div>

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
