import { Filter, Search } from 'lucide-react';
import DocumentCard from './DocumentCard';

export default function DocumentList() {
  const documents = [
    {
      id: 1,
      title: 'Employment Contract - John Smith.pdf',
      status: 'completed' as const,
      date: 'Completed 2 days ago',
      recipients: 2,
      signed: 2
    },
    {
      id: 2,
      title: 'NDA - Tech Partnership Agreement.pdf',
      status: 'waiting' as const,
      date: 'Sent 1 week ago',
      recipients: 3,
      signed: 1
    },
    {
      id: 3,
      title: 'Service Agreement Q4 2024.pdf',
      status: 'pending' as const,
      date: 'Created today',
      recipients: 4,
      signed: 0
    },
    {
      id: 4,
      title: 'Vendor Contract - Office Supplies.pdf',
      status: 'waiting' as const,
      date: 'Sent 3 days ago',
      recipients: 2,
      signed: 1
    },
    {
      id: 5,
      title: 'Lease Agreement - Commercial Space.pdf',
      status: 'completed' as const,
      date: 'Completed 1 week ago',
      recipients: 3,
      signed: 3
    },
    {
      id: 6,
      title: 'Consulting Agreement - Marketing.pdf',
      status: 'pending' as const,
      date: 'Created yesterday',
      recipients: 1,
      signed: 0
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Documents</h2>
        <p className="text-gray-600">Manage and track all your documents in one place</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} {...doc} />
        ))}
      </div>
    </div>
  );
}
