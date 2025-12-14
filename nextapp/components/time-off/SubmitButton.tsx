import React from 'react';

interface SubmitButtonProps {
  loading: boolean;
  text?: string;
  loadingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  loading, 
  text = 'Add Member', 
  loadingText = 'Adding...' 
}) => {
  return (
    <div className="pt-4">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? loadingText : text}
      </button>
    </div>
  );
};

export default SubmitButton;