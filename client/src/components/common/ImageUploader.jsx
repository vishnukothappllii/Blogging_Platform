import React, { useRef } from 'react';

const ImageUploader = ({ id, onFileChange, previewUrl, className = '' }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={className}>
      <input
        id={id}
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="w-full h-64 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <button
              type="button"
              onClick={triggerFileInput}
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-200 transition"
            >
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg w-full h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors"
          onClick={triggerFileInput}
        >
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              Click to upload thumbnail
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PNG, JPG, or GIF (max 5MB)
            </p>
            <button
              type="button"
              className="mt-4 bg-white text-black py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Select Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
