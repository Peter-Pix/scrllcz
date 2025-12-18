import React, { useState } from 'react';

export interface ButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  // Added type prop to support HTML button types (button, submit, reset)
  type?: 'button' | 'submit' | 'reset';
}

// Destructured type prop with a default value of 'button'
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
    danger: "text-red-400 hover:text-red-100 hover:bg-red-900/30",
  };
  return (
    <button 
      // Applied the type prop to the underlying HTML button element
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
