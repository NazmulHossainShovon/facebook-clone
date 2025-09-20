'use client';

import React, { useState, useRef } from 'react';
import { useProcessS3Url } from '@/hooks/dubHooks';
import { uploadToS3 } from '@/utils/uploadToS3';
import UploadSection from './UploadSection';
import ProgressSection from './ProgressSection';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import ActionButtons from './ActionButtons';

const Dub = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [s3Url, setS3Url] = useState('');
  const [mergedVideoUrl, setMergedVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    mutate: processS3Url,
    isPending,
    isError,
    error,
    isSuccess,
    data,
    reset,
  } = useProcessS3Url();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);
    setMergedVideoUrl('');

    try {
      // Upload to S3 with progress tracking
      const url = await uploadToS3(file, 'user', progress =>
        setUploadProgress(progress)
      );

      setS3Url(url);

      // Don't automatically process the video - user will click the "Start Processing" button
    } catch (err) {
      console.error('Upload failed:', err);
      // Handle error appropriately
    } finally {
      setIsUploading(false);
    }
  };

  // Set merged video URL when data is available
  React.useEffect(() => {
    if (data?.success && data.mergedVideoS3Url) {
      setMergedVideoUrl(data.mergedVideoS3Url);
    }
  }, [data]);

  const handleDownload = () => {
    if (mergedVideoUrl) {
      const link = document.createElement('a');
      link.href = mergedVideoUrl;
      link.download = 'dubbed-video.mp4'; // You can customize the filename
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          <SuccessMessage 
            mergedVideoUrl={mergedVideoUrl} 
            handleDownload={handleDownload} 
          />
        )}

        {/* Error message */}
        {isError && <ErrorMessage error={error} />}

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

          <UploadSection 
            isUploading={isUploading} 
            isPending={isPending} 
            handleFileUpload={handleFileUpload} 
          />

          <ProgressSection 
            isUploading={isUploading} 
            uploadProgress={uploadProgress} 
            uploadedFileName={uploadedFileName} 
          />

          <ActionButtons 
            handleReset={handleReset}
            s3Url={s3Url}
            isSuccess={isSuccess}
            isPending={isPending}
            processS3Url={processS3Url}
          />
        </div>
      </div>
    </div>
  );
};

export default Dub;
