'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface UploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function UploadSection({ onUpload, isLoading }: UploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        setFileName(file.name);
        onUpload(file);
      } else {
        alert('Please drop a CSV file');
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      onUpload(file);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Conversations</h2>
      
      <form onSubmit={handleSubmit} className="w-full">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="pointer-events-none">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV files only</p>
            
            {fileName && (
              <p className="mt-3 text-sm font-medium text-green-600">
                ✓ {fileName}
              </p>
            )}
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="mt-2 text-sm font-medium text-gray-700">Processing...</p>
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format Required</h3>
        <p className="text-sm text-blue-800">
          Expected columns: Session ID, Appointment ID, Chat Date, Chat Time IST, POC, MSG TYPE, CONTENT
        </p>
      </div>
    </section>
  );
}
