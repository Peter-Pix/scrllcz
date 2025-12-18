
import React, { useState, useEffect } from 'react';

export interface ButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button' 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50",
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const useCopyFeedback = (timeout = 2000) => {
  const [copied, setCopied] = useState(false);
  
  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  };

  return { copied, copy };
};

/* --- MODAL COMPONENT --- */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'info' | 'danger' | 'warning';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, variant = 'info' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
        {/* Header decoration based on variant */}
        <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-rose-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-slate-400 text-sm leading-relaxed mb-8">
            {children}
          </div>
          
          {footer ? (
            <div className="flex justify-end gap-3">
              {footer}
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={onClose} variant="secondary">Zavřít</Button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-zoom-in { animation: zoomIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};
