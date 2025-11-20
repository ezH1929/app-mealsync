'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-accent',
    error: 'bg-destructive',
    info: 'bg-navy',
  }[type];

  return (
    <div
      className={`fixed bottom-8 right-8 ${bgColor} text-white px-6 py-4 rounded-lg shadow-card flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}