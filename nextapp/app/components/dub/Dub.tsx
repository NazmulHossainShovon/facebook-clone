import React from 'react';

const Dub = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Paste YouTube URL
        </h1>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
          <button className="bg-black hover:bg-black/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
            Process URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dub;
