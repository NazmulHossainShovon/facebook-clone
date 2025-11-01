import { SheetRow } from 'types/chartTypes';
import { createLayout, createNonNumericChart } from './chartHelpers';

// Helper function to create 3D line chart
export const createLine3DChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[]
): { chartData: any[]; layout: any } => {
  // 3D line chart needs at least 3 numeric columns (x, y, z)
  if (numericColumns.length >= 3) {
    const xCol = numericColumns[0];
    const yCol = numericColumns[1];
    const zCol = numericColumns[2];

    const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
    const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
    const zValues: number[] = data.map(row => parseFloat(row[zCol]) || 0);

    const chartData = [
      {
        x: xValues,
        y: yValues,
        z: zValues,
        type: 'scatter3d',
        mode: 'lines',
        line: { color: '#3b82f6' },
      },
    ];

    const layout = {
      title: `3D Line Chart: ${xCol} vs ${yCol} vs ${zCol}`,
      scene: {
        xaxis: { title: xCol },
        yaxis: { title: yCol },
        zaxis: { title: zCol },
      },
      margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
    };

    return { chartData, layout };
  } else if (numericColumns.length >= 2) {
    // Use index as third dimension if we only have 2 numeric columns
    const xCol = numericColumns[0];
    const yCol = numericColumns[1];

    const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
    const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
    const zValues: number[] = data.map((_, i) => i);

    const chartData = [
      {
        x: xValues,
        y: yValues,
        z: zValues,
        type: 'scatter3d',
        mode: 'lines',
        line: { color: '#3b82f6' },
      },
    ];

    const layout = {
      title: `3D Line Chart: ${xCol} vs ${yCol}`,
      scene: {
        xaxis: { title: xCol },
        yaxis: { title: yCol },
        zaxis: { title: 'Index' },
      },
      margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
    };

    return { chartData, layout };
  } else if (numericColumns.length === 1) {
    // Use index for y and z if we only have 1 numeric column
    const numericCol = numericColumns[0];

    const xValues: number[] = data.map((_, i) => i);
    const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);
    const zValues: number[] = data.map((_, i) => i * 0.5); // Simple z progression

    const chartData = [
      {
        x: xValues,
        y: yValues,
        z: zValues,
        type: 'scatter3d',
        mode: 'lines',
        line: { color: '#3b82f6' },
      },
    ];

    const layout = {
      title: `3D Line Chart: ${numericCol}`,
      scene: {
        xaxis: { title: 'Index' },
        yaxis: { title: numericCol },
        zaxis: { title: 'Z (Index)' },
      },
      margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
    };

    return { chartData, layout };
  } else {
    // No numeric columns - fallback to non-numeric chart
    return createNonNumericChart(data);
  }
};

// Helper function to create scatter3d chart
export const createScatter3DChart = (
  data: any[],
  oneDArray1: any[],
  oneDArray2: any[]
): { chartData: any[]; layout: any } => {
  // Process x, y, z data arrays 
  const xValues: number[] = data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const values = Object.values(item);
      return values.length > 0 ? parseFloat(String(values[0]) || '0') : 0;
    }
    return parseFloat(String(item) || '0');
  }).filter(val => !isNaN(val));
  
  const yValues: number[] = oneDArray1.map(item => {
    if (typeof item === 'object' && item !== null) {
      const values = Object.values(item);
      return values.length > 0 ? parseFloat(String(values[0]) || '0') : 0;
    }
    return parseFloat(String(item) || '0');
  }).filter(val => !isNaN(val));
  
  const zValues: number[] = oneDArray2.map(item => {
    if (typeof item === 'object' && item !== null) {
      const values = Object.values(item);
      return values.length > 0 ? parseFloat(String(values[0]) || '0') : 0;
    }
    return parseFloat(String(item) || '0');
  }).filter(val => !isNaN(val));

  // Find the minimum length to ensure all arrays have the same size
  const minLength = Math.min(xValues.length, yValues.length, zValues.length);
  
  // Truncate arrays to the same length
  const truncatedX = xValues.slice(0, minLength);
  const truncatedY = yValues.slice(0, minLength);
  const truncatedZ = zValues.slice(0, minLength);

  const chartData = [
    {
      x: truncatedX,
      y: truncatedY,
      z: truncatedZ,
      type: 'scatter3d',
      mode: 'markers',
      marker: { 
        size: 5,
        color: '#3b82f6',
        opacity: 0.8
      },
    },
  ];

  const layout = {
    title: '3D Scatter Plot',
    scene: {
      xaxis: { title: 'X-axis' },
      yaxis: { title: 'Y-axis' },
      zaxis: { title: 'Z-axis' },
    },
    margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
  };

  return { chartData, layout };
};

// Helper function to create generic chart for other chart types
export const createGenericChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[],
  selectedChartType: string,
  selectedXColumn?: string,
  selectedYColumn?: string,
  selectedZColumn?: string
): { chartData: any[]; layout: any } => {
  // Handle scatter3d as a special case
  if (
    selectedChartType === 'scatter3d' &&
    selectedXColumn &&
    selectedYColumn &&
    selectedZColumn
  ) {
    // For scatter3d, we now directly create the chart using the data arrays
    // The actual data arrays will be passed in SheetData.tsx when scatter3d is selected
    // This conditional will be bypassed in favour of direct implementation in SheetData.tsx
    // This is kept for backward compatibility with function signature
  }

  if (numericColumns.length === 1) {
    const numericCol = numericColumns[0];
    const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
    const xCol = nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];

    const xValues: (string | number)[] = data.map(row => row[xCol]);
    const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        x: xValues,
        y: yValues,
        type: selectedChartType as any,
      },
    ];

    const layout = createLayout(
      `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}: ${numericCol} by ${xCol}`,
      xCol,
      numericCol
    );

    return { chartData, layout };
  } else if (numericColumns.length > 1) {
    // Multiple numeric columns - create a basic chart with first numeric column as y-axis
    const xCol = headers[0]; // Use first column as x-axis
    const xValues: (string | number)[] = data.map(row => row[xCol]);
    const numericCol = numericColumns[0];
    const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        x: xValues,
        y: yValues,
        type: selectedChartType as any,
      },
    ];

    const layout = createLayout(
      `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}: ${numericCol}`,
      xCol,
      numericCol
    );

    return { chartData, layout };
  } else {
    // No numeric columns - use only chart types that make sense with non-numeric data
    if (
      [
        'bar',
        'pie',
        'funnel',
        'funnelarea',
        'sunburst',
        'treemap',
        'icicle',
      ].includes(selectedChartType)
    ) {
      const values: number[] = Array(data.length).fill(1); // Equal distribution
      const labels: string[] = data.map((row, i) => `Row ${i + 1}`);

      const chartData = [
        {
          values: values,
          labels: labels,
          type: selectedChartType as any,
        },
      ];

      const layout = createLayout(
        `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}: Data Distribution`
      );

      return { chartData, layout };
    } else {
      // For chart types that don't work well with non-numeric data, fall back to a basic chart
      return createNonNumericChart(data);
    }
  }
};

// Helper function to create contour chart
export const createContourChart = (
  headers: string[],
  data: any[],
  numericColumns: string[],
  selectedNumericColumn?: string,
  twoDArray1?: any[][] // Additional parameter for twoDArray1
): { chartData: any[]; layout: any } => {
  // If a 2D array is provided (from range values), use it directly for the contour plot
  if (twoDArray1 && twoDArray1.length > 0) {
    // Convert all values to numbers
    const zValues: number[][] = twoDArray1.map(row =>
      row.map(val => (typeof val === 'number' ? val : parseFloat(val) || 0))
    );

    const chartData = [
      {
        z: zValues,
        type: 'contour',
        colorscale: 'Viridis', // Optional: Color scheme (e.g., 'Viridis', 'Hot', 'Jet')
        contours: {
          showlabels: true, // Optional: Show contour labels
          labelfont: {
            family: 'Raleway',
            color: 'white', // Optional: Label styling
          },
        },
        hoverlabel: {
          bgcolor: 'white', // Optional: Hover tooltip background
          bordercolor: 'black', // Optional: Hover tooltip border
          font: {
            family: 'Raleway',
            color: 'black', // Optional: Hover text styling
          },
        },
      },
    ];

    const layout = createLayout(
      `Contour Plot (from range)`,
      'X axis',
      'Y axis'
    );

    return { chartData, layout };
  }

  // If a specific numeric column is selected, use it; otherwise default to the first available
  const col =
    selectedNumericColumn &&
    (numericColumns.includes(selectedNumericColumn) ||
      headers.includes(selectedNumericColumn))
      ? selectedNumericColumn
      : numericColumns[0];

  if (!col) {
    // No numeric column available, return empty chart
    return { chartData: [], layout: createLayout('Contour Plot') };
  }

  // Extract values for the selected column
  const zValues: number[][] = [];

  // For a simple contour plot, we'll create a simple 2D matrix from the data
  // If the data has multiple rows, we can use them as rows in the matrix
  // If we have a single numeric column, we can organize the data into a 2D grid
  if (data.length > 0) {
    const colData = data.map(row => {
      // Access the value using bracket notation with the column name
      const val = row[col];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });

    // Create a square matrix from the column data
    const size = Math.ceil(Math.sqrt(colData.length));
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const idx = i * size + j;
        row.push(idx < colData.length ? colData[idx] : 0);
      }
      zValues.push(row);
    }
  }

  const chartData = [
    {
      z: zValues,
      type: 'contour',
      colorscale: 'Viridis', // Optional: Color scheme (e.g., 'Viridis', 'Hot', 'Jet')
      contours: {
        showlabels: true, // Optional: Show contour labels
        labelfont: {
          family: 'Raleway',
          color: 'white', // Optional: Label styling
        },
      },
      hoverlabel: {
        bgcolor: 'white', // Optional: Hover tooltip background
        bordercolor: 'black', // Optional: Hover tooltip border
        font: {
          family: 'Raleway',
          color: 'black', // Optional: Hover text styling
        },
      },
    },
  ];

  const layout = createLayout(`Contour Plot`, 'X axis', 'Y axis');

  return { chartData, layout };
};

// Helper function to create heatmap chart
export const createHeatmapChart = (
  headers: string[],
  data: any[],
  numericColumns: string[],
  selectedNumericColumn?: string,
  twoDArray1?: any[][] // Additional parameter for twoDArray1
): { chartData: any[]; layout: any } => {
  // If a 2D array is provided (from range values), use it directly for the heatmap
  if (twoDArray1 && twoDArray1.length > 0) {
    // Convert all values to numbers
    const zValues: number[][] = twoDArray1.map(row =>
      row.map(val => (typeof val === 'number' ? val : parseFloat(val) || 0))
    );

    // Create sample x and y labels based on the dimensions of the 2D array
    const xLabels = Array(twoDArray1[0]?.length || 0)
      .fill(0)
      .map((_, i) => `Column ${i + 1}`);
    const yLabels = Array(twoDArray1.length)
      .fill(0)
      .map((_, i) => `Row ${i + 1}`);

    const chartData = [
      {
        z: zValues, // 2D array of values (rows x columns)
        x: xLabels, // Optional: x-axis labels
        y: yLabels, // Optional: y-axis labels
        type: 'heatmap',
        colorscale: 'Viridis', // Optional: Color scheme (e.g., 'Viridis', 'Blues', or custom array)
        showscale: true, // Optional: Show color bar
      },
    ];

    const layout = createLayout(`Heatmap (from range)`, 'X axis', 'Y axis');

    return { chartData, layout };
  }

  // If a specific numeric column is selected, use it; otherwise default to the first available
  const col =
    selectedNumericColumn &&
    (numericColumns.includes(selectedNumericColumn) ||
      headers.includes(selectedNumericColumn))
      ? selectedNumericColumn
      : numericColumns[0];

  if (!col) {
    // No numeric column available, return empty chart
    return { chartData: [], layout: createLayout('Heatmap') };
  }

  // Extract values for the selected column
  const zValues: number[][] = [];

  // For a simple heatmap, we'll create a simple 2D matrix from the data
  // If the data has multiple rows, we can use them as rows in the matrix
  // If we have a single numeric column, we can organize the data into a 2D grid
  if (data.length > 0) {
    const colData = data.map(row => {
      // Access the value using bracket notation with the column name
      const val = row[col];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });

    // Create a square matrix from the column data
    const size = Math.ceil(Math.sqrt(colData.length));
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const idx = i * size + j;
        row.push(idx < colData.length ? colData[idx] : 0);
      }
      zValues.push(row);
    }
  }

  // Create sample x and y labels based on the dimensions of the 2D array
  const xLabels = Array(zValues[0]?.length || 0)
    .fill(0)
    .map((_, i) => `Column ${i + 1}`);
  const yLabels = Array(zValues.length)
    .fill(0)
    .map((_, i) => `Row ${i + 1}`);

  const chartData = [
    {
      z: zValues, // 2D array of values (rows x columns)
      x: xLabels, // Optional: x-axis labels
      y: yLabels, // Optional: y-axis labels
      type: 'heatmap',
      colorscale: 'Viridis', // Optional: Color scheme (e.g., 'Viridis', 'Blues', or custom array)
      showscale: true, // Optional: Show color bar
    },
  ];

  const layout = createLayout(`Heatmap`, 'X axis', 'Y axis');

  return { chartData, layout };
};

// Helper function to create 2D histogram contour chart
export const createHistogram2DContour = (
  headers: string[],
  data: any[],
  numericColumns: string[],
  selectedNumericColumn?: string,
  selectedNonNumericColumn?: string,
  oneDArray1?: any[] // Additional parameter for oneDArray1
): { chartData: any[]; layout: any } => {
  // If specific columns are selected, use them; otherwise default to the first available
  let xCol: string;
  let yCol: string;
  console.log(data, oneDArray1);

  const chartData = [
    {
      x: data,
      y: oneDArray1,
      type: 'histogram2dcontour',
      colorscale: 'Blues', // Optional: Color scheme (e.g., 'Viridis', 'Hot')
      contours: {
        showlabels: true, // Optional: Show contour labels
        labelfont: {
          family: 'Raleway',
          color: 'white', // Optional: Label styling
        },
      },
      hoverlabel: {
        bgcolor: 'white', // Optional: Hover tooltip background
        bordercolor: 'black', // Optional: Hover tooltip border
        font: {
          family: 'Raleway',
          color: 'black', // Optional: Hover text styling
        },
      },
    },
  ];

  const layout = createLayout(`2D Histogram Contour`, 'X axis', 'Y axis');

  return { chartData, layout };
};
