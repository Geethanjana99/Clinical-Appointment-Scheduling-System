import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UploadIcon } from 'lucide-react';
const UploadReports = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Upload Medical Reports
        </h1>
      </div>
      <Card>
        <div className="text-center py-12">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Upload Your Reports
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop your medical reports here or click to browse
          </p>
          <div className="mt-6">
            <Button variant="primary">
              <UploadIcon className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>
        </div>
      </Card>
    </div>;
};
export default UploadReports;