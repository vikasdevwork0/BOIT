import React, { useRef } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onError: (message: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const validateAndPassFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      const allowedExts = ['.pdf', '.txt', '.csv'];

      if (!allowedExts.includes(ext)) {
        errors.push(`'${file.name}' is an unsupported file format. Only PDF, TXT, and CSV are allowed.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`'${file.name}' exceeds the 10MB file size limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      onError(errors.join(' '));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      className="upload-dropzone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.txt,.csv"
        style={{ display: 'none' }}
      />
      <div className="dropzone-content">
        <div className="upload-icon font-mono text-2xl">📁</div>
        <div className="upload-title font-semibold">Drop financial documents here or click to browse</div>
        <div className="upload-subtitle text-sm text-gray-500">
          Supports <strong>PDF</strong>, <strong>TXT</strong>, and <strong>CSV</strong> (Max 10MB per file)
        </div>
      </div>
    </div>
  );
};
