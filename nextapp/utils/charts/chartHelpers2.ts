import { SheetRow } from 'types/chartTypes';
import { createLayout, createNonNumericChart } from './chartHelpers';

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
  data: any[],
  numericColumns: string[],
  xAxisTitle?: string
): { chartData: any[]; layout: any } => {
  if (data.length >= 1) {
    const numericCol = numericColumns[0];

    const chartData = [
      {
        y: data,
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
  chartType: string,
  selectedNumericColumn?: string,
  selectedNonNumericColumn?: string
): { chartData: any[]; layout: any } => {
  if (numericColumns.length >= 1) {
    // Determine which columns to use based on user selection or defaults
    const numericCol =
      selectedNumericColumn && numericColumns.includes(selectedNumericColumn)
        ? selectedNumericColumn
        : numericColumns[0];

    // Extract labels and values from the data
    const labels = data.map(row => row[selectedNonNumericColumn!]);
    const values = data.map(row => row[selectedNumericColumn!]);

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
      numericCol,
      selectedNonNumericColumn,
      { showlegend: false }
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
