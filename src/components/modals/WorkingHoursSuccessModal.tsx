import React from 'react';
import { CheckCircleIcon, XIcon, ClockIcon } from 'lucide-react';

interface WorkingHoursSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkingHoursSuccessModal: React.FC<WorkingHoursSuccessModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Close button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Modal content */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Working Hours Updated Successfully!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Your working hours have been saved and updated. The new schedule will be available to patients immediately.
                </p>
                <div className="mt-3 flex items-center text-sm text-green-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Schedule is now active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={handleClose}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursSuccessModal;
