import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedFormat: string;
  onFormatChange: (f: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

const FORMAT_OPTIONS = ['ALL', 'PNG', 'JPG', 'WEBP', 'GIF', 'SVG'];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  selectedFormat,
  onFormatChange,
  sortBy,
  onSortChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-6 pb-2">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search images by filename or extension..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Format Pills & Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 rounded-xl p-1 overflow-x-auto">
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(fmt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedFormat === fmt
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex items-center">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-slate-900/70 border border-slate-800 text-slate-300 text-xs font-medium pl-8 pr-7 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="size-desc">Largest Size</option>
            <option value="size-asc">Smallest Size</option>
            <option value="name">Name (A-Z)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        </div>
      </div>

    </div>
  );
};
