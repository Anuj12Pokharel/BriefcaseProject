import { useState } from 'react';
import { Upload as UploadIcon, FileText, X, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../context/DocumentContext';

export default function Upload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { setDocument } = useDocument();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleContinue = () => {
    if (uploadedFile) {
      // Save the uploaded file in context as a blob URL
      setDocument(URL.createObjectURL(uploadedFile), 'pdf');
      navigate('/prepare', { state: { fileName: uploadedFile.name } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Document</h1>
          <p className="text-lg text-gray-600">Upload a document to prepare it for signature</p>
        </div>

        {!uploadedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`${isDragging ? 'bg-blue-100' : 'bg-gray-100'} p-6 rounded-full mb-6 transition-colors`}>
                <UploadIcon className={`h-16 w-16 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drag and drop your document here
              </h3>
              <p className="text-gray-600 mb-6">or</p>
              <label className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-6">Supported format: PDF</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{uploadedFile.name}</h3>
                  <p className="text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Document Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      defaultValue={uploadedFile.name.replace('.pdf', '')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Recipients (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add a message for the recipients..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setUploadedFile(null)}
                className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Continue to Prepare</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <UploadIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Step 1: Upload</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Upload your PDF document to get started
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Step 2: Prepare</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Add signature fields and form elements
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Step 3: Send</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Send to recipients for signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
