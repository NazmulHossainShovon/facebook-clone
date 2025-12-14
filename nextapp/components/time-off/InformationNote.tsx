import React from 'react';

const InformationNote: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-md">
      <h2 className="font-medium text-blue-800 mb-2">Note:</h2>
      <p className="text-sm text-blue-700">
        This form adds a member to an existing team. Leave dates can be added separately.
      </p>
    </div>
  );
};

export default InformationNote;