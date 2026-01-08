'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls]);
    }

    setUploading(false);
    setUploadProgress({});
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 4.5 * 1024 * 1024, // 4.5MB
    disabled: uploading || images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveToMain = (index: number) => {
    if (index === 0) return; // Already main
    const newImages = [...images];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" strokeWidth={2} />
            </div>
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop images here...</p>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Drag & drop images here
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  or click to browse files
                </p>
              </>
            )}
            <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
              <p>Supports: JPEG, PNG, WebP, GIF</p>
              <p>Max size: 4.5 MB per image</p>
              <p>Max {maxImages} images total ({images.length}/{maxImages} uploaded)</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                  {filename}
                </p>
                <p className="text-sm text-blue-600 ml-2">{progress}%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Uploaded Images ({images.length})
            </label>
            {images.length > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click any image to set as main
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className={`relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 transition-all ${
                  index === 0 
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400'
                }`}
                onClick={() => index !== 0 && moveToMain(index)}
                title={index === 0 ? 'Main image' : 'Click to set as main image'}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Main Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Main
                  </div>
                )}
                
                {/* Set as Main hint */}
                {index !== 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none">
                    <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      Set as Main
                    </div>
                  </div>
                )}
                
                {/* Image Number */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                  {index + 1}
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  title="Remove image"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No images uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}

