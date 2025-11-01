// Helper function to create surface chart
export const createSurfaceChart = (
  data: any[],
  oneDArray1: any[],
  twoDArray1: any[][]
): { chartData: any[]; layout: any } => {
  // Process x, y, z data arrays for surface plot
  // x and y are 1D arrays (coordinates)
  // z is a 2D array (surface heights)

  const chartData = [
    {
      z: twoDArray1, // 2D array for surface heights
      x: data, // 1D array for X coordinates
      y: oneDArray1, // 1D array for Y coordinates
      type: 'surface',
      colorscale: 'Viridis', // Color scheme
    },
  ];

  const layout = {
    title: '3D Surface Plot',
    scene: {
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1 }, // Adjust camera view
      },
      xaxis: { title: 'X-axis' },
      yaxis: { title: 'Y-axis' },
      zaxis: { title: 'Z-axis' },
    },
    margin: { l: 60, r: 30, b: 60, t: 70, pad: 4 },
  };

  return { chartData, layout };
};
