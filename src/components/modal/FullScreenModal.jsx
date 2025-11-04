import React from 'react';

const FullScreenModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions = [],
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-navy-800 w-full h-full flex flex-col">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800">
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            {title}
          </h2>
          
          <div className="flex items-center gap-3">
            {/* Custom actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  action.variant === 'primary' 
                    ? 'bg-brand-500 text-white hover:bg-brand-600' 
                    : action.variant === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {action.label}
              </button>
            ))}
            
            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
