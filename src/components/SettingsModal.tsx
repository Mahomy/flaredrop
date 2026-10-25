import React, { useState } from 'react';
import { X, Cloud, Check, Trash2, ExternalLink } from 'lucide-react';
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
  const [accountId, setAccountId] = useState(config.accountId || '');
  const [apiToken, setApiToken] = useState(config.apiToken || '');
  const [accountHash, setAccountHash] = useState(config.accountHash || '');
  const [enabled, setEnabled] = useState(config.enabled || false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      accountId: accountId.trim(),
      apiToken: apiToken.trim(),
      accountHash: accountHash.trim(),
      enabled: enabled && Boolean(accountId.trim() && apiToken.trim())
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
              <h3 className="font-bold text-white text-base">Storage & API Settings</h3>
              <p className="text-xs text-slate-400">Configure Cloudflare Images or Local Vault</p>
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

          {/* Toggle Cloudflare Mode */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm text-white block">Cloudflare Direct Upload</span>
              <span className="text-xs text-slate-400">Upload images to Cloudflare CDN instead of browser vault</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Cloudflare Account ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cloudflare Account ID
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. dc9867f8a1cf9c3548137121a3c613c2"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Cloudflare API Token */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cloudflare API Token
            </label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Cloudflare API Token with Images Edit permission"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-slate-500">Stored safely only in your browser localStorage</span>
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Get API Token <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Account Hash */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Images Delivery Account Hash <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={accountHash}
              onChange={(e) => setAccountHash(e.target.value)}
              placeholder="Custom imagedelivery.net hash"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Clear Storage */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete all saved images from local storage?')) {
                  onClearAllImages();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Saved Cards
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
