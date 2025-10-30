import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  customColors?: { primary?: string; secondary?: string };
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  customColors,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    const iconColor = customColors?.primary;
    const iconClass = "w-5 h-5";

    switch (type) {
      case 'success':
        return <CheckCircle className={iconClass} style={iconColor ? { color: iconColor } : { color: '#4ade80' }} />;
      case 'warning':
        return <AlertTriangle className={iconClass} style={iconColor ? { color: iconColor } : { color: '#fbbf24' }} />;
      case 'error':
        return <XCircle className={iconClass} style={iconColor ? { color: iconColor } : { color: '#f87171' }} />;
      case 'info':
        return <Info className={iconClass} style={iconColor ? { color: iconColor } : { color: '#60a5fa' }} />;
    }
  };

  const getStyles = () => {
    if (customColors?.primary) {
      return {
      backgroundColor: customColors.primary, 
        borderColor: `${customColors.primary}40`,
        color: customColors.secondary || '#FFFFF'
      };
    }

    switch (type) {
      case 'success':
        return { className: 'bg-green-50 border-green-200 text-green-800' };
      case 'warning':
        return { className: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
      case 'error':
        return { className: 'bg-red-50 border-red-200 text-red-800' };
      case 'info':
        return { className: 'bg-blue-50 border-blue-200 text-blue-800' };
    }
  };

  const styles = getStyles();
  const hasCustomColors = customColors?.secondary;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out ${hasCustomColors ? '' : styles.className || ''}`}
      style={hasCustomColors ? styles : undefined}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm mt-1 opacity-40">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};