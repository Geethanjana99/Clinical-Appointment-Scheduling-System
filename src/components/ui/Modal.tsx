import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black bg-opacity-50" 
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-xl bg-white shadow-2xl`}
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header (conditional) */}
            {title && (
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className={title ? "px-6 py-4" : ""}>{children}</div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;