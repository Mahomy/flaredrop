import React, { useState } from 'react';
import { X, Cloud, Check, Trash2, ExternalLink, HardDrive, CheckCircle } from 'lucide-react';
import { CloudflareConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CloudflareConfig;
  onSaveConfig: (cfg: CloudflareConfig) => void;
  onClearAllImages: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onClearAllImages
}) => {
  const [accountId, setAccountId] = useState(config.accountId || 'dc9867f8a1cf9c3548137121a3c613c2');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      accountId: accountId.trim(),
      apiToken: '',
      accountHash: '',
      enabled: true
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cloudflare R2 Storage Status</h3>
              <p className="text-xs text-slate-400">Direct Global Object Storage • 100% Ad-Free</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Connected R2 Bucket Status */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm text-white">Active R2 Bucket</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                Connected
              </span>
            </div>
            
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Bucket:</span>
                <span className="text-amber-300 font-bold">myfirstbucket</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Public CDN:</span>
                <span className="text-cyan-300">pub-e8bb4cc169594fc9a7cd29b4abf502cc.r2.dev</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account ID:</span>
                <span className="text-slate-300">{accountId}</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-200/90 leading-relaxed">
            All images are uploaded directly to your Cloudflare R2 bucket and served with clean, ad-free URLs accessible worldwide from any device or mobile browser.
          </div>

          {/* Clear Storage */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear local card cache? (Your files in Cloudflare R2 will remain safe).')) {
                  onClearAllImages();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Local View Cache
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 font-bold"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Done!
                </>
              ) : (
                'OK'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
