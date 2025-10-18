import React from 'react';

interface ActionButtonsProps {
  handleReset: () => void;
  s3Url: string;
  isSuccess: boolean;
  isPending: boolean;
  processS3Url: (data: { s3Url: string; targetLanguage?: string; voiceGender?: string }) => void;
  selectedLanguage: string;
  selectedGender: 'male' | 'female';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  handleReset, 
  s3Url, 
  isSuccess, 
  isPending, 
  processS3Url,
  selectedLanguage,
  selectedGender
}) => {
  return (
    <div className="flex space-x-2">
      <button
        type="button"
        onClick={handleReset}
        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex-1"
      >
        Reset
      </button>

      {s3Url && !isSuccess && (
        <button
          type="button"
          onClick={() => processS3Url({ s3Url, targetLanguage: selectedLanguage, voiceGender: selectedGender })}
          className={`bg-black hover:bg-black/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex-1 ${
            isPending ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'Start Processing'}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;