'use client';

import React, { useState, useEffect } from 'react';

interface SheetRow {
  [key: string]: string;
}

const SheetData = () => {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [PlotComponent, setPlotComponent] = useState<any>(null);

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
    import('react-plotly.js').then((PlotModule) => {
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

  // Helper function to create consistent layout with common properties
  const createLayout = (titleText: string, xAxisTitle?: string, yAxisTitle?: string, additionalProps: any = {}) => {
    const layout: any = {
      title: {
        text: titleText,
        font: {
          family: 'Arial, sans-serif',
          size: 16,
          color: '#2d3748'
        },
        x: 0.5,  // Center the title horizontally
        xanchor: 'center',
        y: 0.95, // Position the title vertically
        yanchor: 'top'
      },
      margin: {
        l: 60,
        r: 30,
        b: 60,
        t: 70,  // Increased top margin to make room for title
        pad: 4
      }
    };

    // Add x-axis title if provided
    if (xAxisTitle) {
      layout.xaxis = {
        title: {
          text: xAxisTitle,
          font: { family: 'Arial, sans-serif', size: 12, color: '#2d3748' }
        }
      };
    }

    // Add y-axis title if provided
    if (yAxisTitle) {
      layout.yaxis = {
        title: {
          text: yAxisTitle,
          font: { family: 'Arial, sans-serif', size: 12, color: '#2d3748' }
        }
      };
    }

    // Add any additional properties
    Object.assign(layout, additionalProps);

    return layout;
  };

  // Prepare chart data
  const prepareChartData = (): { chartData: any[]; layout: any } => {
    if (data.length === 0) return { chartData: [], layout: {} };

    const headers = Object.keys(data[0]);
    if (headers.length < 2) return { chartData: [], layout: {} };

    // Try to detect numeric columns for charting
    const numericColumns: string[] = [];
    const firstDataRow = data[0];
    
    for (const header of headers) {
      // Check if the value in the first row is numeric
      const value = firstDataRow[header];
      if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
        numericColumns.push(header);
      }
    }

    let chartData: any[] = [];
    let layout: any = {};

    if (numericColumns.length > 0) {
      // If we have numeric columns, create a bar chart
      if (numericColumns.length === 1) {
        // Single numeric column - use first non-numeric as x-axis
        const numericCol = numericColumns[0];
        const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
        const xCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];
        
        const xValues: (string | number)[] = data.map(row => row[xCol]);
        const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);
        
        chartData = [
          {
            x: xValues,
            y: yValues,
            type: 'bar',
            marker: { color: '#3b82f6' },
          }
        ];
        
        layout = createLayout(
          `Bar Chart: ${numericCol} by ${xCol}`,
          xCol,
          numericCol
        );
      } else {
        // Multiple numeric columns - create grouped bar chart
        const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
        const xCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];
        const xValues: (string | number)[] = data.map(row => row[xCol]);
        
        chartData = numericColumns.map(col => ({
          x: xValues,
          y: data.map(row => parseFloat(row[col]) || 0),
          type: 'bar',
          name: col,
        }));
        
        layout = createLayout(
          `Comparison Chart: ${numericColumns.join(' vs ')}`,
          xCol,
          'Values',
          { barmode: 'group' }
        );
      }
    } else {
      // No numeric columns, create a simple chart with text data
      const values: number[] = Array(data.length).fill(1); // Equal distribution
      const labels: string[] = data.map((row, i) => `Row ${i + 1}`);
      
      chartData = [
        {
          values: values,
          labels: labels,
          type: 'pie',
        }
      ];
      
      layout = createLayout('Data Distribution');
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
