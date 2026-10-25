import React, { useEffect, useState } from 'react';
import { X, Copy, ExternalLink, Download, Check } from 'lucide-react';
import { UploadedImage } from '../types';
import { formatBytes } from '../services/storage';
import { downloadDirectImage } from '../services/cloudflare';

interface LightboxModalProps {
  image: UploadedImage | null;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  image,
  onClose,
  onCopyUrl
}) => {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const handleDownload = async () => {
    setDownloading(true);
    await downloadDirectImage(image.url, image.name);
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-[#0c121e] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2 truncate pr-4">
            <h3 className="font-semibold text-sm text-white truncate max-w-md">
              {image.name}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({formatBytes(image.size)})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Preview Area */}
        <div className="flex-1 flex items-center justify-center bg-black/60 p-4 overflow-hidden min-h-[300px]">
          <img
            src={image.url}
            alt={image.name}
            className="max-h-[70vh] max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Footer info & actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 font-mono text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl truncate select-all">
            {image.url}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onCopyUrl(image.url)}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
            <button
              onClick={handleDownload}
              className={`px-3 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 ${
                downloading
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Download direct image"
            >
              {downloading ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Downloaded!' : 'Download'}</span>
            </button>
            <a
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
              title="Open raw image directly"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
