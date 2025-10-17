'use client';

import React, { useState, useRef } from 'react';
import { useProcessS3Url } from '@/hooks/dubHooks';
import { uploadToS3 } from '@/utils/uploadToS3';
import { POPULAR_LANGUAGES, getVoiceId, isGenderSupportedForLanguage } from '@/lib/voice-mapping';
import UploadSection from './UploadSection';
import ProgressSection from './ProgressSection';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import ActionButtons from './ActionButtons';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Dub = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [s3Url, setS3Url] = useState('');
  const [mergedVideoUrl, setMergedVideoUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
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
    } catch (err: any) {
      console.error('Upload failed:', err);
      // Show error message in toast
      let errorMessage = 'Upload failed';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast({
        title: errorMessage,
        variant: 'destructive',
      });
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
    setSelectedLanguage('en');
    setSelectedGender('female');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle language change and update gender if not supported
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    
    // If current gender is not supported for the new language, switch to supported one
    if (!isGenderSupportedForLanguage(languageCode, selectedGender)) {
      const supportedGender = isGenderSupportedForLanguage(languageCode, 'female') ? 'female' : 'male';
      setSelectedGender(supportedGender);
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

        {/* Language and Voice Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUploading || isPending}
            >
              {POPULAR_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Type
            </label>
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={selectedGender === 'female'}
                  onChange={(e) => setSelectedGender(e.target.value as 'male' | 'female')}
                  disabled={!isGenderSupportedForLanguage(selectedLanguage, 'female') || isUploading || isPending}
                  className="mr-2"
                />
                <span className={!isGenderSupportedForLanguage(selectedLanguage, 'female') ? 'text-gray-400' : ''}>
                  Female
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={selectedGender === 'male'}
                  onChange={(e) => setSelectedGender(e.target.value as 'male' | 'female')}
                  disabled={!isGenderSupportedForLanguage(selectedLanguage, 'male') || isUploading || isPending}
                  className="mr-2"
                />
                <span className={!isGenderSupportedForLanguage(selectedLanguage, 'male') ? 'text-gray-400' : ''}>
                  Male
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Using voice: {getVoiceId(selectedLanguage, selectedGender)}
            </p>
          </div>
        </div>

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
            selectedLanguage={selectedLanguage}
            selectedGender={selectedGender}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Dub;
