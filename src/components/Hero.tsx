import { Upload, FileText, Send, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Sign Documents Securely
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload, sign, and send documents for signature in minutes. Trusted by thousands of businesses worldwide.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/upload" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Get Started</span>
          </Link>
          <div className="relative flex items-center">
            <select className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Choose Template</option>
              <option>Employment Contract</option>
              <option>Non-Disclosure Agreement</option>
              <option>Service Agreement</option>
              <option>Vendor Contract</option>
              <option>Consulting Agreement</option>
              <option>Lease Agreement</option>
              <option>Partnership Agreement</option>
              <option>Sales Contract</option>
            </select>
            <Link to="/templates" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </Link>
            <Link to="/templates" className="absolute right-10 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </Link>
            <Link to="/templates" className="absolute right-16 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </Link>
            <Link to="/templates" className="absolute right-24 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </Link>
            <Link to="/templates" className="absolute right-32 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
              <Settings className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your document or choose from templates
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign</h3>
            <p className="text-gray-600 leading-relaxed">
              Add signature fields and sign electronically
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Send className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Send</h3>
            <p className="text-gray-600 leading-relaxed">
              Send to recipients and track signatures in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
