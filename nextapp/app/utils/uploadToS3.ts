import apiClient from '@/lib/api-client';

export const uploadToS3 = async (
  file: File, 
  userName: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Get presigned URL from backend
  const { data } = await apiClient.get(
    `/api/s3/signed-url?contentType=${file.type}&userName=${userName}`
  );

  const { uploadUrl, imageUrl } = data;

  // Upload file to S3 with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });
    
    // Handle upload completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    
    // Handle upload errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    // Handle upload abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });
    
    // Start the upload
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  return imageUrl;
};
