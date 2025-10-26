import { SheetRow } from '../types/chartTypes';

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
      l: 80,
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

// Helper function to create pie chart
export const createPieChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[]
): { chartData: any[]; layout: any } => {
  if (numericColumns.length === 1) {
    const numericCol = numericColumns[0];
    const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
    const labelsCol =
      nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];

    const labels: string[] = data.map(row => row[labelsCol]);
    const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        values: values,
        labels: labels,
        type: 'pie',
      },
    ];

    const layout = createLayout(`Pie Chart: ${numericCol}`);

    return { chartData, layout };
  } else {
    // No numeric columns or multiple numeric columns, create a simple pie chart
    return createNonNumericChart(data);
  }
};

// Helper function to create bubble chart
export const createBubbleChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[]
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 3) {
    const xCol = numericColumns[0];
    const yCol = numericColumns[1];
    const sizeCol = numericColumns[2];

    const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
    const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
    const sizeValues: number[] = data.map(row => parseFloat(row[sizeCol]) || 1);

    const chartData = [
      {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: sizeValues,
          sizemode: 'diameter',
          sizeref:
            (2 * Math.max(...sizeValues)) /
            (100 * Math.min(1, Math.max(...sizeValues) / 100)),
          color: '#3b82f6',
        },
        name: 'Bubble Chart',
      },
    ];

    const layout = createLayout(
      `Bubble Chart: ${xCol} vs ${yCol} vs ${sizeCol}`,
      xCol,
      yCol
    );

    return { chartData, layout };
  } else if (numericColumns.length >= 2) {
    // Use the second column as size if we only have 2 numeric columns
    const xCol = numericColumns[0];
    const yCol = numericColumns[1];

    const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
    const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);
    const sizeValues: number[] = data.map(
      row => Math.abs(parseFloat(row[yCol]) || 10) + 5
    ); // Use y values as bubble size

    const chartData = [
      {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: sizeValues,
          sizemode: 'diameter',
          sizeref:
            (2 * Math.max(...sizeValues)) /
            (100 * Math.min(1, Math.max(...sizeValues) / 100)),
          color: '#3b82f6',
        },
        name: 'Bubble Chart',
      },
    ];

    const layout = createLayout(`Bubble Chart: ${xCol} vs ${yCol}`, xCol, yCol);

    return { chartData, layout };
  } else if (numericColumns.length === 1) {
    // Use index as x and y values as size if we only have 1 numeric column
    const numericCol = numericColumns[0];

    const xValues: number[] = data.map((_, i) => i);
    const yValues: number[] = data.map((_, i) => i * 0.5); // Simple y progression
    const sizeValues: number[] = data.map(
      row => Math.abs(parseFloat(row[numericCol]) || 10) + 5
    );

    const chartData = [
      {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: sizeValues,
          sizemode: 'diameter',
          sizeref:
            (2 * Math.max(...sizeValues)) /
            (100 * Math.min(1, Math.max(...sizeValues) / 100)),
          color: '#3b82f6',
        },
        name: 'Bubble Chart',
      },
    ];

    const layout = createLayout(
      `Bubble Chart: ${numericCol}`,
      'Index',
      'Index'
    );

    return { chartData, layout };
  } else {
    // No numeric columns - fallback to non-numeric chart
    return createNonNumericChart(data);
  }
};

// Helper function to create scatter, line, or area chart
export const createScatterLineAreaChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[],
  chartType: string
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 2) {
    const xCol = numericColumns[0];
    const yCol = numericColumns[1];

    const xValues: number[] = data.map(row => parseFloat(row[xCol]) || 0);
    const yValues: number[] = data.map(row => parseFloat(row[yCol]) || 0);

    let mode = 'markers';
    let fill = '';
    let name = 'Scatter Plot';

    if (chartType === 'line') {
      mode = 'lines';
      name = 'Line Chart';
    } else if (chartType === 'area') {
      mode = 'lines';
      fill = 'tozeroy';
      name = 'Area Chart';
    }

    const chartData = [
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

    const layout = createLayout(`${name}: ${xCol} vs ${yCol}`, xCol, yCol);

    return { chartData, layout };
  } else if (numericColumns.length === 1) {
    // Create a chart with index as x-axis
    const numericCol = numericColumns[0];

    const xValues: number[] = data.map((_, i) => i);
    const yValues: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    let mode = 'lines';
    let fill = '';
    let name =
      chartType === 'line'
        ? 'Line Chart'
        : chartType === 'area'
          ? 'Area Chart'
          : 'Scatter Plot'; // Default to scatter plot

    if (chartType === 'area') {
      fill = 'tozeroy';
    } else if (chartType === 'scatter') {
      mode = 'markers';
    }

    const chartData = [
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

    const layout = createLayout(`${name}: ${numericCol}`, 'Index', numericCol);

    return { chartData, layout };
  } else {
    // No numeric columns
    return createNonNumericChart(data);
  }
};

// Helper function to create histogram
export const createHistogram = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[]
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 1) {
    const numericCol = numericColumns[0];
    const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        x: values,
        type: 'histogram',
      },
    ];

    const layout = createLayout(
      `Histogram: ${numericCol}`,
      numericCol,
      'Count'
    );

    return { chartData, layout };
  } else {
    // No numeric data, use all rows as equal distribution
    return createNonNumericChart(data);
  }
};

// Helper function to create box plot
export const createBoxPlot = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[]
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 1) {
    const numericCol = numericColumns[0];
    const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        y: values,
        type: 'box',
      },
    ];

    const layout = createLayout(
      `Box Plot: ${numericCol}`,
      undefined,
      numericCol
    );

    return { chartData, layout };
  } else {
    // No numeric data fallback
    return createNonNumericChart(data);
  }
};

// Helper function to create violin plot
export const createViolinPlot = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[],
  xAxisTitle?: string
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 1) {
    const numericCol = numericColumns[0];
    const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        y: values,
        type: 'violin',
        box: {
          visible: true,
        },
        meanline: {
          visible: true,
        },
        fillcolor: 'lightblue',
        line: {
          color: 'blue',
        },
      },
    ];

    const layout = createLayout(
      `Violin Plot: ${numericCol}`,
      xAxisTitle || undefined,
      numericCol
    );

    return { chartData, layout };
  } else {
    // No numeric data fallback
    return createNonNumericChart(data);
  }
};

// Helper function to create funnel or funnel area chart
export const createFunnelChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[],
  chartType: string
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 1) {
    // Try to find a non-numeric column to use as labels
    const nonNumericCols = headers.filter(h => !numericColumns.includes(h));
    const labelsCol =
      nonNumericCols.length > 0 ? nonNumericCols[0] : headers[0];
    const numericCol = numericColumns[0];

    // Extract labels and values from the data
    const labels: string[] = data.map(
      row => row[labelsCol] || `Stage ${data.indexOf(row) + 1}`
    );
    const values: number[] = data.map(row => parseFloat(row[numericCol]) || 0);

    const chartData = [
      {
        type: chartType as any,
        y: labels,
        x: values,
        textinfo: 'value+percent previous',
        textposition: 'inside',
        marker: {
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
          line: { width: 2, color: '#FFFFFF' },
        },
        connector: {
          line: { color: '#CCCCCC', width: 2, dash: 'dot' },
        },
      },
    ];

    const baseLayout = createLayout(
      `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${numericCol}`,
      'Values',
      'Stages',
      { showlegend: true }
    );

    const layout = {
      ...baseLayout,
    };

    return { chartData, layout };
  } else {
    // No numeric columns, fallback to a simple chart
    const labels: string[] = data.map((row, i) => `Row ${i + 1}`);
    const values: number[] = data.map(() => 1); // Equal distribution

    const chartData = [
      {
        type: chartType as any,
        y: labels,
        x: values,
        textinfo: 'value+percent previous',
        textposition: 'inside',
        marker: {
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
          line: { width: 2, color: '#FFFFFF' },
        },
        connector: {
          line: { color: '#CCCCCC', width: 2, dash: 'dot' },
        },
      },
    ];

    const baseLayout = createLayout(
      `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: Data Distribution`,
      'Values',
      'Stages',
      { showlegend: false }
    );

    const layout = {
      ...baseLayout,
      width: 600,
      height: 500,
    };

    return { chartData, layout };
  }
};

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

// Helper function to create generic chart for other chart types
export const createGenericChart = (
  headers: string[],
  data: SheetRow[],
  numericColumns: string[],
  selectedChartType: string
): { chartData: any[]; layout: any } => {
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
