'use client';

import React, { useState } from 'react';
import { useProcessYoutubeUrl } from '@/hooks/dubHooks';

const Dub = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const { mutate: processYoutubeUrl, isPending, isError, error, isSuccess, reset } = useProcessYoutubeUrl();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    processYoutubeUrl({ youtubeUrl });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Paste YouTube URL
        </h1>
        
        {/* Success message */}
        {isSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800">
            YouTube URL processed successfully!
          </div>
        )}
        
        {/* Error message */}
        {isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800">
            {error?.message || 'An error occurred while processing the URL'}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
            disabled={isPending}
          />
          <button 
            type="submit"
            className={`bg-black hover:bg-black/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Process URL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dub;
