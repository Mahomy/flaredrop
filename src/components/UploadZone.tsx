import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isUploading: boolean;
  uploadProgress: { current: number; total: number; filename: string } | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  isUploading,
  uploadProgress
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 md:p-10 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99] shadow-xl shadow-cyan-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />

        {isUploading && uploadProgress ? (
          <div className="max-w-md mx-auto py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-spin">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Uploading {uploadProgress.current} of {uploadProgress.total}...
            </p>
            <p className="text-xs text-slate-400 truncate mb-3">
              {uploadProgress.filename}
            </p>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 flex items-center gap-2">
              Drop your images here, or <span className="text-cyan-400 underline underline-offset-4">browse</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-4">
              Upload single or multiple images. Get instant direct CDN URLs in a card layout ready to copy.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">PNG</span>
              <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">JPG / JPEG</span>
              <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">WEBP</span>
              <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">GIF</span>
              <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">SVG</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
