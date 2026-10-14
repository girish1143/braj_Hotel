'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { uploadFileToS3, S3UploadResponse } from '../lib/api';

interface S3UploadDropzoneProps {
  label: string;
  sublabel?: string;
  folder?: string;
  currentValue?: string;
  onUploadSuccess: (url: string, data?: S3UploadResponse) => void;
  acceptTypes?: 'image' | 'document' | 'all';
  sampleUrl?: string;
  sampleLabel?: string;
  required?: boolean;
}

export default function S3UploadDropzone({
  label,
  sublabel,
  folder = 'hotels',
  currentValue = '',
  onUploadSuccess,
  acceptTypes = 'image',
  sampleUrl,
  sampleLabel = 'Use Curated Sample Photo',
  required = false
}: S3UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentValue);
  const [isS3Uploaded, setIsS3Uploaded] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMime =
    acceptTypes === 'document'
      ? '.pdf,.doc,.docx'
      : acceptTypes === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
      : 'image/*,.pdf';

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit. Please choose a smaller file.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      // Call API
      const result = await uploadFileToS3(file, folder);

      setUploadProgress(100);
      setPreviewUrl(result.url);
      setIsS3Uploaded(result.isS3);
      onUploadSuccess(result.url, result);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please check network or try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    setIsS3Uploaded(false);
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = (url: string) => {
    return (
      url.startsWith('data:image') ||
      url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) ||
      url.includes('unsplash.com') ||
      url.includes('/hotels/') ||
      url.includes('/rooms/') ||
      url.includes('/bhojan/')
    );
  };

  return (
    <div className="space-y-2">
      {/* Label and Quick Actions */}
      <div className="flex justify-between items-center text-xs">
        <label className="font-semibold text-neutral-800 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {sampleUrl && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(sampleUrl);
                setIsS3Uploaded(false);
                onUploadSuccess(sampleUrl);
              }}
              className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1 transition"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{sampleLabel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] text-neutral-500 hover:text-neutral-800 underline transition"
          >
            {showManualInput ? 'Switch to Dropzone' : 'Or paste URL'}
          </button>
        </div>
      </div>

      {sublabel && <p className="text-[11px] text-neutral-500">{sublabel}</p>}

      {/* Manual URL Input mode */}
      {showManualInput ? (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://..."
            value={previewUrl}
            onChange={(e) => {
              setPreviewUrl(e.target.value);
              setIsS3Uploaded(false);
              onUploadSuccess(e.target.value);
            }}
            className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition"
          />
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
              : 'border-neutral-200 hover:border-amber-400 bg-neutral-50/60 hover:bg-neutral-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedMime}
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="py-4 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-xs font-semibold text-neutral-700">Uploading to AWS S3 Bucket...</p>
              <div className="w-48 bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
              <div className="w-10 h-10 rounded-full bg-amber-100/70 flex items-center justify-center text-amber-700 shadow-sm">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                Click to browse or drag & drop file here
              </p>
              <p className="text-[10px] text-neutral-400">
                Supports {acceptTypes === 'document' ? 'PDF, DOC, DOCX' : 'JPG, PNG, WEBP, SVG'} (Max 20MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-medium bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Section */}
      {previewUrl && (
        <div className="relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900/5 p-2 flex items-center gap-3">
          {isImage(previewUrl) ? (
            <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 shadow-sm">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (sampleUrl) (e.target as any).src = sampleUrl;
                }}
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <FileText className="w-8 h-8" />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-800 truncate">
                {previewUrl.split('/').pop() || 'Uploaded File'}
              </span>
              {isS3Uploaded && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>AWS S3</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-neutral-500 truncate mt-0.5">{previewUrl}</p>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 rounded-md hover:bg-white transition"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
