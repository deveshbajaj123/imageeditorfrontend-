import { useState, useRef } from 'react';
import { photoAPI } from '../../services/api';

export default function PhotoUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    // Filter only images
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    if (imageFiles.length > 10) {
      alert('Maximum 10 files at once');
      return;
    }

    // Upload files
    await uploadFiles(imageFiles);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });

      const response = await photoAPI.upload(formData);

      setUploadProgress(100);
      
      // Show success message
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        
        // Callback to parent
        if (onUploadComplete) {
          onUploadComplete(response.data.photos);
        }
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Failed to upload photos');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button (for small screens) */}
      <button
        onClick={openFileDialog}
        disabled={uploading}
        className="md:hidden w-full btn-primary mb-4 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : '📤 Upload Photos'}
      </button>

      {/* Drag and drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 bg-white'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="text-4xl">⏳</div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Uploading photos...
              </p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-5xl">📤</div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Drop photos here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, WEBP (Max 10 files, 10MB each)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}