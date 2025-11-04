import SheetData from 'components/charts/SheetData';
import ProtectedRoute from 'components/ProtectedRoute';
import React from 'react';

const ChartApp = () => {
  return (
    <ProtectedRoute>
      <div>
        <SheetData />
      </div>
    </ProtectedRoute>
  );
};

export default ChartApp;
