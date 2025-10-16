import { Search, Filter, FileText, Download, Eye, Star } from 'lucide-react';

export default function Templates() {

  const templates = [
    {
      id: 1,
      name: 'Employment Contract',
      category: 'HR',
      description: 'Standard employment agreement template',
      downloads: 1243,
      popular: true
    },
    {
      id: 2,
      name: 'Non-Disclosure Agreement',
      category: 'Legal',
      description: 'Mutual NDA for confidential information',
      downloads: 2156,
      popular: true
    },
    {
      id: 3,
      name: 'Service Agreement',
      category: 'Business',
      description: 'Client service contract template',
      downloads: 987,
      popular: false
    },
    {
      id: 4,
      name: 'Vendor Contract',
      category: 'Procurement',
      description: 'Vendor services agreement',
      downloads: 654,
      popular: false
    },
    {
      id: 5,
      name: 'Consulting Agreement',
      category: 'Business',
      description: 'Independent contractor agreement',
      downloads: 1876,
      popular: true
    },
    {
      id: 6,
      name: 'Lease Agreement',
      category: 'Real Estate',
      description: 'Commercial property lease',
      downloads: 543,
      popular: false
    },
    {
      id: 7,
      name: 'Partnership Agreement',
      category: 'Legal',
      description: 'Business partnership contract',
      downloads: 765,
      popular: false
    },
    {
      id: 8,
      name: 'Sales Contract',
      category: 'Sales',
      description: 'Product or service sales agreement',
      downloads: 1432,
      popular: true
    }
  ];

  const categories = ['All', 'HR', 'Legal', 'Business', 'Procurement', 'Real Estate', 'Sales'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Templates</h1>
          <p className="text-lg text-gray-600">
            Choose from our library of professionally crafted templates
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                category === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
            >
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-8 flex items-center justify-center relative">
                {template.popular && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Popular</span>
                  </div>
                )}
                <FileText className="h-20 w-20 text-blue-600" />
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
                    {template.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                  <span className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads.toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                    Use Template
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
