import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Trash2, Eye, Cloud, Globe } from 'lucide-react';
import { UploadedImage } from '../types';
import { formatBytes } from '../services/storage';

interface ImageCardProps {
  image: UploadedImage;
  onCopyUrl: (url: string) => void;
  onDelete: (id: string) => void;
  onPreview: (image: UploadedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onCopyUrl,
  onDelete,
  onPreview
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyUrl(image.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extension = image.name.split('.').pop()?.toUpperCase() || 'IMG';

  return (
    <div className="group relative bg-[#0c121e] border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col">
      
      {/* Image Preview Container */}
      <div
        onClick={() => onPreview(image)}
        className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer"
      >
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded-md">
            {extension}
          </span>
          {image.source === 'cloudflare' ? (
            <span className="bg-amber-950/85 backdrop-blur-md border border-amber-800/60 text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Cloud className="w-2.5 h-2.5" /> CF CDN
            </span>
          ) : (
            <span className="bg-cyan-950/85 backdrop-blur-md border border-cyan-800/60 text-[10px] font-bold text-cyan-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Public CDN
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(image); }}
            className="p-2 bg-slate-800/90 hover:bg-cyan-500 hover:text-slate-950 text-white rounded-xl transition shadow-lg"
            title="Preview Fullscreen"
          >
            <Eye className="w-4 h-4" />
          </button>
          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-slate-800/90 hover:bg-cyan-500 hover:text-slate-950 text-white rounded-xl transition shadow-lg"
            title="Open Direct Link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
            className="p-2 bg-slate-800/90 hover:bg-red-500 text-white rounded-xl transition shadow-lg"
            title="Delete Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div>
          <h4
            title={image.name}
            className="font-semibold text-sm text-slate-100 truncate mb-1"
          >
            {image.name}
          </h4>

          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <span>{formatBytes(image.size)}</span>
            <span>•</span>
            {image.width && image.height ? (
              <>
                <span>{image.width}×{image.height}</span>
                <span>•</span>
              </>
            ) : null}
            <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 1-Click Copy URL Box */}
        <div
          onClick={handleCopy}
          className={`group/copy relative flex items-center justify-between gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-slate-300'
          }`}
          title="Click to copy direct HTTPS image URL"
        >
          <span className="font-mono text-xs truncate flex-1 select-all">
            {image.url}
          </span>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition shrink-0 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 group-hover/copy:bg-cyan-500 group-hover/copy:text-slate-950 text-slate-400'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

    </div>
  );
};
