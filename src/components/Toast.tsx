import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        let borderClass = 'border-emerald-500/40 bg-slate-900/95';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
          borderClass = 'border-red-500/40 bg-slate-900/95';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
          borderClass = 'border-cyan-500/40 bg-slate-900/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium text-slate-200 animate-in slide-in-from-bottom-2 duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 truncate">
              {icon}
              <span className="truncate">{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
