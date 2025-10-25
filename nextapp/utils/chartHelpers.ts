import { SheetRow } from 'components/SheetData';

// Helper function to create consistent layout with common properties
export const createLayout = (
  titleText: string,
  xAxisTitle?: string,
  yAxisTitle?: string,
  additionalProps: any = {}
) => {
  const layout: any = {
    title: {
      text: titleText,
      font: {
        family: 'Arial, sans-serif',
        size: 16,
        color: '#2d3748',
      },
      x: 0.5, // Center the title horizontally
      xanchor: 'center',
      y: 0.95, // Position the title vertically
      yanchor: 'top',
    },
    margin: {
      l: 60,
      r: 30,
      b: 60,
      t: 70, // Increased top margin to make room for title
      pad: 4,
    },
  };

  // Add x-axis title if provided
  if (xAxisTitle) {
    layout.xaxis = {
      title: {
        text: xAxisTitle,
        font: { family: 'Arial, sans-serif', size: 12, color: '#2d3748' },
      },
    };
  }

  // Add y-axis title if provided
  if (yAxisTitle) {
    layout.yaxis = {
      title: {
        text: yAxisTitle,
        font: { family: 'Arial, sans-serif', size: 12, color: '#2d3748' },
      },
    };
  }

  // Add any additional properties
  Object.assign(layout, additionalProps);

  return layout;
};

// Helper function to detect numeric columns
export const detectNumericColumns = (
  headers: string[],
  firstDataRow: SheetRow
): string[] => {
  const numericColumns: string[] = [];

  for (const header of headers) {
    // Check if the value in the first row is numeric
    const value = firstDataRow[header];
    if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
      numericColumns.push(header);
    }
  }

  return numericColumns;
};

// Helper function to create chart for single numeric column
export const createSingleNumericChart = (
  headers: string[],
  numericColumns: string[],
  data: SheetRow[]
) => {
  const numericCol = numericColumns[0];
  const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
  const xCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];

  const xValues: (string | number)[] = data.map(row => row[xCol]);
  const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

  const chartData = [
    {
      x: xValues,
      y: yValues,
      type: 'bar',
      marker: { color: '#3b82f6' },
    },
  ];

  const layout = createLayout(
    `Bar Chart: ${numericCol} by ${xCol}`,
    xCol,
    numericCol
  );

  return { chartData, layout };
};

// Helper function to create chart for multiple numeric columns
export const createMultipleNumericChart = (
  headers: string[],
  numericColumns: string[],
  data: SheetRow[]
) => {
  const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
  const xCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];
  const xValues: (string | number)[] = data.map(row => row[xCol]);

  const chartData = numericColumns.map(col => ({
    x: xValues,
    y: data.map(row => parseFloat(row[col]) || 0),
    type: 'bar',
    name: col,
  }));

  const layout = createLayout(
    `Comparison Chart: ${numericColumns.join(' vs ')}`,
    xCol,
    'Values',
    { barmode: 'group' }
  );

  return { chartData, layout };
};

// Helper function to create chart for non-numeric data
export const createNonNumericChart = (data: SheetRow[]) => {
  const values: number[] = Array(data.length).fill(1); // Equal distribution
  const labels: string[] = data.map((row, i) => `Row ${i + 1}`);

  const chartData = [
    {
      values: values,
      labels: labels,
      type: 'pie',
    },
  ];

  const layout = createLayout('Data Distribution');

  return { chartData, layout };
};
