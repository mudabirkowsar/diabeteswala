"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    // Auto hide after 4 seconds
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  const closeNotification = () => setNotification(null);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification UI */}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <NotificationCard 
                message={notification.message} 
                type={notification.type} 
                onClose={closeNotification} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

// Hook to use notification
export const useNotification = () => useContext(NotificationContext);

// Internal UI Component
const NotificationCard = ({ message, type, onClose }) => {
  const styles = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <AlertCircle className="text-red-500" size={20} />,
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: <AlertTriangle className="text-amber-500" size={20} />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: <Info className="text-blue-500" size={20} />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`${currentStyle.bg} ${currentStyle.border} border p-4 rounded-2xl shadow-xl flex items-center gap-4 min-w-[300px] max-w-md`}>
      <div className="shrink-0">{currentStyle.icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${currentStyle.text}`}>{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  );
};