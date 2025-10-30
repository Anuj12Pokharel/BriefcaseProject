import { useState } from 'react';
import { Search, Filter, FileText, Download, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../context/DocumentContext';

function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl p-8 min-w-[320px] max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">×</button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Templates() {
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [cloneTemplate, setCloneTemplate] = useState<any>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<any>(null);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [useTemplate, setUseTemplate] = useState<any>(null);
  const navigate = useNavigate();
  const { setFieldValues } = useDocument();

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
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => setUseTemplate(template)}>
                    Use Template
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Preview" onClick={() => setPreviewTemplate(template)}>
                    <Eye className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Clone" onClick={() => setCloneTemplate(template)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 18h16" /></svg>
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Edit" onClick={() => setEditTemplate(template)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l12-12a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Delete" onClick={() => setDeleteTemplate(template)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
      {/* Add New Template Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>Add New Template</span>
        </button>
      </div>

      {/* Modals for actions */}
      <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name ? `Preview: ${previewTemplate.name}` : 'Preview'}>
        <div className="text-gray-700">Template preview coming soon.</div>
      </Modal>
      <Modal open={!!cloneTemplate} onClose={() => setCloneTemplate(null)} title={cloneTemplate?.name ? `Clone: ${cloneTemplate.name}` : 'Clone'}>
        <div className="text-gray-700">Clone template functionality coming soon.</div>
      </Modal>
      <Modal open={!!editTemplate} onClose={() => setEditTemplate(null)} title={editTemplate?.name ? `Edit: ${editTemplate.name}` : 'Edit'}>
        <div className="text-gray-700">Edit template functionality coming soon.</div>
      </Modal>
      <Modal open={!!deleteTemplate} onClose={() => setDeleteTemplate(null)} title={deleteTemplate?.name ? `Delete: ${deleteTemplate.name}` : 'Delete'}>
        <div className="text-gray-700 mb-4">Are you sure you want to delete this template?</div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors mr-2" onClick={() => setDeleteTemplate(null)}>Delete</button>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" onClick={() => setDeleteTemplate(null)}>Cancel</button>
      </Modal>
      <Modal open={addNewOpen} onClose={() => setAddNewOpen(false)} title="Add New Template">
        <div className="text-gray-700">Add new template form coming soon.</div>
      </Modal>
      <Modal open={!!useTemplate} onClose={() => setUseTemplate(null)} title={useTemplate?.name ? `Use: ${useTemplate.name}` : 'Use Template'}>
        <div className="text-gray-700">Start using this template.</div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => setUseTemplate(null)} className="px-3 py-1.5 bg-gray-100 rounded">Cancel</button>
          <button onClick={() => {
            // insert template into Upload message via context and navigate back
            setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + (useTemplate?.description || '') : (useTemplate?.description || '') }));
            setUseTemplate(null);
            navigate('/upload');
          }} className="px-3 py-1.5 bg-blue-600 text-white rounded">Insert into Upload</button>
        </div>
      </Modal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Templates;
