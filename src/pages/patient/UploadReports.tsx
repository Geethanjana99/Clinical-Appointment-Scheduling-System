import React, { useState, useRef, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  UploadIcon, 
  FileIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  FileTextIcon,
  ImageIcon,
  XIcon,
  DownloadIcon,
  EyeIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  uploadDate: string;
  category: string;
  description: string;
}

interface ExistingReport {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  size: string;
  type: string;
  description: string;
}

// Mock existing reports
const existingReports: ExistingReport[] = [
  {
    id: '1',
    name: 'Blood_Test_Results_Sept2023.pdf',
    category: 'Blood Test',
    uploadDate: '2023-09-30',
    size: '2.4 MB',
    type: 'pdf',
    description: 'Complete blood count and metabolic panel results'
  },
  {
    id: '2',
    name: 'Chest_Xray_Aug2023.jpg',
    category: 'X-Ray',
    uploadDate: '2023-08-15',
    size: '5.1 MB',
    type: 'image',
    description: 'Chest X-ray for routine checkup'
  },
  {
    id: '3',
    name: 'ECG_Report_July2023.pdf',
    category: 'ECG',
    uploadDate: '2023-07-22',
    size: '1.8 MB',
    type: 'pdf',
    description: 'Electrocardiogram test results'
  }
];

const reportCategories = [
  'Blood Test',
  'X-Ray',
  'MRI Scan',
  'CT Scan',
  'ECG',
  'Ultrasound',
  'Prescription',
  'Medical History',
  'Vaccination Record',
  'Other'
];

const UploadReports = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    }
    return <FileTextIcon className="w-6 h-6 text-red-500" />;
  };

  const getExistingFileIcon = (type: string) => {
    if (type === 'image') {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    return <FileTextIcon className="w-5 h-5 text-red-500" />;
  };

  const validateFile = (file: File): boolean => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
      return false;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type "${file.type}" is not supported.`);
      return false;
    }

    return true;
  };

  const simulateUpload = async (fileData: UploadedFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileData.id
            ? { ...f, progress }
            : f
        )
      );
    }

    // Mark as completed
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileData.id
          ? { ...f, status: 'completed' as const }
          : f
      )
    );
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);

    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        const fileData: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          status: 'uploading',
          progress: 0,
          uploadDate: new Date().toISOString().split('T')[0],
          category: '',
          description: ''
        };
        newFiles.push(fileData);
      }
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);

      // Simulate upload for each file
      for (const fileData of newFiles) {
        simulateUpload(fileData);
      }

      toast.success(`${newFiles.length} file(s) uploaded successfully!`);
    }

    setIsUploading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    toast.success('File removed successfully');
  };

  const updateFileCategory = (id: string, category: string) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === id ? { ...f, category } : f
      )
    );
  };

  const updateFileDescription = (id: string, description: string) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === id ? { ...f, description } : f
      )
    );
  };

  const finalizeUploads = async () => {
    const incompleteFiles = uploadedFiles.filter(f => !f.category || f.status !== 'completed');
    
    if (incompleteFiles.length > 0) {
      toast.error('Please complete category selection for all files and wait for uploads to finish.');
      return;
    }

    // Simulate saving to database
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('All reports saved successfully!');
    setUploadedFiles([]);
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
          <p className="text-gray-600 mt-1">Upload and manage your medical documents</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Reports</h2>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Medical Reports
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Supported formats: PDF, JPG, PNG, GIF, DOC, DOCX (Max 10MB per file)
            </p>
            
            <Button
              variant="primary"
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recently Uploaded</h2>
              <Button
                variant="primary"
                onClick={finalizeUploads}
                disabled={isUploading || uploadedFiles.some(f => f.status !== 'completed' || !f.category)}
              >
                Save All Reports
              </Button>
            </div>
            
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {file.status === 'completed' && (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircleIcon className="w-5 h-5 text-red-500" />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2">{file.size}</p>
                      
                      {file.status === 'uploading' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Uploading...</span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Category *
                            </label>
                            <select
                              value={file.category}
                              onChange={(e) => updateFileCategory(file.id, e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select category</option>
                              {reportCategories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={file.description}
                              onChange={(e) => updateFileDescription(file.id, e.target.value)}
                              placeholder="Brief description..."
                              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Existing Reports */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Medical Reports</h2>
          
          {existingReports.length > 0 ? (
            <div className="space-y-3">
              {existingReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getExistingFileIcon(report.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.category}
                        </span>
                        <span className="text-xs text-gray-500">{report.size}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports uploaded yet</h3>
              <p className="text-gray-500">Upload your first medical report to get started</p>
            </div>
          )}
        </div>
      </Card>

      {/* Help Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Supported File Types</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF documents (.pdf)</li>
                <li>• Images (.jpg, .jpeg, .png, .gif)</li>
                <li>• Word documents (.doc, .docx)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tips for Best Results</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use clear, high-quality scans</li>
                <li>• Keep file sizes under 10MB</li>
                <li>• Include all pages of multi-page reports</li>
                <li>• Use descriptive filenames</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadReports;