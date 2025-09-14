'use client';

import React, { useState, useRef } from 'react';
import { useProcessS3Url } from '@/hooks/dubHooks';
import { uploadToS3 } from '@/utils/uploadToS3';

const Dub = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [s3Url, setS3Url] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    mutate: processS3Url,
    isPending,
    isError,
    error,
    isSuccess,
    reset,
  } = useProcessS3Url();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);

    try {
      // Upload to S3 with progress tracking
      const url = await uploadToS3(file, 'user', progress =>
        setUploadProgress(progress)
      );

      setS3Url(url);

      // Send S3 URL to backend
      processS3Url({ s3Url: url });
    } catch (err) {
      console.error('Upload failed:', err);
      // Handle error appropriately
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    reset();
    setS3Url('');
    setUploadedFileName('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Upload Video
        </h1>

        {/* Success message */}
        {isSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800">
            Video processed successfully!
          </div>
        )}

        {/* Error message */}
        {isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800">
            {error?.message || 'An error occurred while processing the video'}
          </div>
        )}

        {/* Upload section */}
        <div className="flex flex-col space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
            disabled={isUploading || isPending}
          />

          <button
            type="button"
            onClick={handleFileUpload}
            className={`border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 text-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors duration-300 flex flex-col items-center justify-center ${
              isUploading || isPending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isUploading || isPending}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Click to upload video</span>
            <span className="text-sm mt-1">(MP4, MOV, AVI, etc.)</span>
          </button>

          {(isUploading || s3Url) && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{uploadedFileName}</span>
                <span>{isUploading ? `${uploadProgress}%` : 'Uploaded'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${isUploading ? uploadProgress : 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex-1"
            >
              Reset
            </button>

            {s3Url && (
              <button
                type="button"
                onClick={() => processS3Url({ s3Url })}
                className={`bg-black hover:bg-black/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex-1 ${
                  isPending ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isPending}
              >
                {isPending ? 'Processing...' : 'Process Video'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dub;
