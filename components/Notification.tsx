
import React, { useEffect } from 'react';
import type { NotificationType } from '../types';
import { CheckCircleIcon, WarningIcon } from '../constants';

interface NotificationProps {
  notification: NotificationType | null;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) {
    return null;
  }

  const baseClasses = "fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 z-50 border backdrop-blur-sm";
  
  const typeClasses = {
    success: 'bg-green-50/80 text-green-800 border-green-200 dark:bg-green-900/60 dark:text-green-200 dark:border-green-800',
    error: 'bg-red-50/80 text-red-800 border-red-200 dark:bg-red-900/60 dark:text-red-200 dark:border-red-800',
    info: 'bg-blue-50/80 text-blue-800 border-blue-200 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-800',
  };

  const Icon = () => {
    switch(notification.type) {
        case 'success': return <CheckCircleIcon className="w-6 h-6 mr-3 text-green-500" />;
        case 'error': return <WarningIcon className="w-6 h-6 mr-3 text-red-500" />;
        case 'info': return null; // Or an info icon
        default: return null;
    }
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`} role="alert">
      <Icon />
      <span className="font-medium flex-grow">{notification.message}</span>
      <button 
        onClick={onClose} 
        className="ml-4 -mr-2 p-1.5 text-current/70 hover:text-current hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
