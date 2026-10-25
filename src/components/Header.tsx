import React from 'react';
import { Cloud, Flame, Settings, Image as ImageIcon, HardDrive } from 'lucide-react';
import { formatBytes } from '../services/storage';

interface HeaderProps {
  totalCount: number;
  totalSize: number;
  isCloudflareActive: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  totalSize,
  isCloudflareActive,
  onOpenSettings
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#070b13]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-500 p-[1px] shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Flare<span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">Drop</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                Vault
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Cloudflare Images & Instant URL Host
            </p>
          </div>
        </div>

        {/* Right Stats & Settings */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Storage stats */}
          <div className="hidden md:flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{totalCount} {totalCount === 1 ? 'image' : 'images'}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatBytes(totalSize)}</span>
            </div>
          </div>

          {/* Mode Pill */}
          <button
            onClick={onOpenSettings}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              isCloudflareActive
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/40'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Configure Cloudflare API keys"
          >
            <Cloud className={`w-3.5 h-3.5 ${isCloudflareActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isCloudflareActive ? 'Cloudflare Active' : 'Local Vault'}
            </span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
