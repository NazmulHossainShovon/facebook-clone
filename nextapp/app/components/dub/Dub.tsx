'use client';

import React, { useState, useRef, useContext } from 'react';
import { useProcessS3Url } from '@/hooks/dubHooks';
import { uploadToS3 } from '@/utils/uploadToS3';
import { isGenderSupportedForLanguage } from '@/lib/voice-mapping';
import { Store } from '@/lib/store';
import UploadSection from './UploadSection';
import ProgressSection from './ProgressSection';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import ActionButtons from './ActionButtons';
import LanguageVoiceSelection from './LanguageVoiceSelection';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Dub = () => {
  const { state, dispatch } = useContext(Store);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [s3Url, setS3Url] = useState('');
  const [mergedVideoUrl, setMergedVideoUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(
    'female'
  );
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

    // Validate file type
    const allowedTypes = [
      'video/mp4', 
      'video/mpeg', 
      'video/quicktime', 
      'video/x-msvideo', 
      'video/x-matroska', 
      'video/webm',
      'video/avi',
      'video/wmv',
      'video/mov',
      'video/flv',
      'video/3gp',
      'video/3g2'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file (MP4, AVI, MOV, MKV, etc.)',
        variant: 'destructive',
      });
      return;
    }

    reset();
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);
    setMergedVideoUrl('');

    try {
      // Upload to S3 with progress tracking
      const { imageUrl, secondsLeft } = await uploadToS3(file, 'user', progress =>
        setUploadProgress(progress)
      );

      setS3Url(imageUrl);

      // Update user's secondsLeft in the global store if available
      if (secondsLeft !== undefined) {
        const updatedUserInfo = {
          ...state.userInfo,
          secondsLeft: secondsLeft
        };
        // Dispatch the sign-in action with updated user info to update the store
        dispatch({ type: 'sign-in', payload: updatedUserInfo });
      }

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
      const supportedGender = isGenderSupportedForLanguage(
        languageCode,
        'female'
      )
        ? 'female'
        : 'male';
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

        <LanguageVoiceSelection
          selectedLanguage={selectedLanguage}
          selectedGender={selectedGender}
          isUploading={isUploading}
          isPending={isPending}
          handleLanguageChange={handleLanguageChange}
          setSelectedGender={setSelectedGender}
        />

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
