// src/pages/Templates.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Eye, Star, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocument } from '../context/DocumentContext';

type DocTemplate = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  downloads?: number;
  popular?: boolean;
};

function Modal({ open, title, onClose, children }: { 
  open: boolean; 
  title?: string; 
  onClose?: () => void; 
  children?: React.ReactNode 
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg relative z-50 w-full max-w-2xl p-6">
        {title && <div className="text-lg font-semibold mb-4">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { setFieldValues } = useDocument();

  const [templateType, setTemplateType] = useState<'document' | 'message'>('document');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [templates] = useState<DocTemplate[]>([
    { id: 'tpl-1', name: 'Simple Agreement', description: 'A basic agreement template.', category: 'Agreements', downloads: 1234, popular: true },
    { id: 'tpl-2', name: 'Invoice', description: 'Standard invoice template.', category: 'Finance', downloads: 432, popular: false },
    { id: 'tpl-3', name: 'NDA Template', description: 'Non-disclosure agreement template.', category: 'Agreements', downloads: 856, popular: true },
    { id: 'tpl-4', name: 'Contract Template', description: 'General contract template.', category: 'Legal', downloads: 623, popular: false },
  ]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[]))], [templates]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return templates;
    return templates.filter(t => t.category === selectedCategory);
  }, [templates, selectedCategory]);

  const [messageTemplates, setMessageTemplates] = useState<Array<{ id: string; title: string; body: string; updatedAt?: number }>>(() => {
    try {
      const raw = localStorage.getItem('messageTemplates');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'messageTemplates') {
        try {
          const raw = localStorage.getItem('messageTemplates');
          setMessageTemplates(raw ? JSON.parse(raw) : []);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Modal state
  const [previewTemplate, setPreviewTemplate] = useState<DocTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState<{ title: string; body: string } | null>(null);
  const [useTemplate, setUseTemplate] = useState<DocTemplate | null>(null);
  const [cloneTemplate, setCloneTemplate] = useState<DocTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<DocTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<DocTemplate | null>(null);
  const [addNewOpen, setAddNewOpen] = useState(false);

  const insertMessageToUpload = (body?: string) => {
    if (!body) return;
    setFieldValues((prev: Record<string, any>) => ({ 
      ...prev, 
      messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + body : body 
    }));
    navigate('/upload');
  };

  const handleTemplateTypeChange = (type: 'document' | 'message') => {
    setTemplateType(type);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          {/* Hover Dropdown Menu for Template Selection */}
          <div
            className="relative inline-block"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-lg font-bold text-gray-900">TEMPLATES</span>
              <span className="text-sm text-gray-500">
                ({templateType === 'document' ? 'Document' : 'Message'})
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Shows on Hover */}
            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
                <button
                  onClick={() => handleTemplateTypeChange('document')}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                    templateType === 'document' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Document Templates</div>
                    <div className="text-xs text-gray-500">Agreements, invoices & more</div>
                  </div>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => handleTemplateTypeChange('message')}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                    templateType === 'message' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <div>
                    <div className="font-medium">Message Templates</div>
                    <div className="text-xs text-gray-500">Pre-written messages</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {isAdmin && templateType === 'message' && (
            <button 
              onClick={() => navigate('/manage-templates')} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              Manage Message Templates
            </button>
          )}
        </div>

        {/* Document Templates View */}
        {templateType === 'document' && (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === selectedCategory 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden group">
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
                        <span>{(template.downloads || 0).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" 
                        onClick={() => setUseTemplate(template)}
                      >
                        Use Template
                      </button>
                      <button 
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        title="Preview" 
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-5 w-5 text-gray-600" />
                      </button>
                      <button 
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        title="Clone" 
                        onClick={() => setCloneTemplate(template)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 18h16" />
                        </svg>
                      </button>
                      <button 
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        title="Edit" 
                        onClick={() => setEditTemplate(template)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l12-12a2.828 2.828 0 00-4-4L5 17v4z" />
                        </svg>
                      </button>
                      <button 
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                        title="Delete" 
                        onClick={() => setDeleteTemplate(template)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Message Templates View */}
        {templateType === 'message' && isAdmin && (
          <div className="mt-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Message Templates</h2>
                <div className="text-sm text-gray-600">Insert pre-written messages into your uploads</div>
              </div>

              <div className="space-y-3">
                {messageTemplates.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-8">No message templates yet</div>
                )}
                {messageTemplates.map((t) => (
                  <div key={t.id} className="p-4 border rounded-lg flex items-start justify-between hover:border-gray-300 transition-colors">
                    <div>
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        title="Preview" 
                        onClick={() => setPreviewMessage({ title: t.title, body: t.body })} 
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => insertMessageToUpload(t.body)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        Insert
                      </button>
                      <button 
                        onClick={() => navigate('/manage-templates')} 
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Add New Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" 
            onClick={() => setAddNewOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Template</span>
          </button>
        </div>

        {/* Modals */}
        <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name ? `Preview: ${previewTemplate.name}` : 'Preview'}>
          <div className="text-gray-700">
            <p className="mb-2"><strong>Category:</strong> {previewTemplate?.category}</p>
            <p className="mb-2"><strong>Description:</strong> {previewTemplate?.description}</p>
            <p className="text-sm text-gray-500">Template preview content coming soon.</p>
          </div>
        </Modal>

        <Modal open={!!cloneTemplate} onClose={() => setCloneTemplate(null)} title={cloneTemplate?.name ? `Clone: ${cloneTemplate.name}` : 'Clone'}>
          <div className="text-gray-700">Clone template functionality coming soon.</div>
        </Modal>

        <Modal open={!!editTemplate} onClose={() => setEditTemplate(null)} title={editTemplate?.name ? `Edit: ${editTemplate.name}` : 'Edit'}>
          <div className="text-gray-700">Edit template functionality coming soon.</div>
        </Modal>

        <Modal open={!!deleteTemplate} onClose={() => setDeleteTemplate(null)} title={deleteTemplate?.name ? `Delete: ${deleteTemplate.name}` : 'Delete'}>
          <div className="text-gray-700 mb-4">Are you sure you want to delete this template?</div>
          <div className="flex justify-end space-x-2">
            <button 
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors" 
              onClick={() => setDeleteTemplate(null)}
            >
              Delete
            </button>
            <button 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" 
              onClick={() => setDeleteTemplate(null)}
            >
              Cancel
            </button>
          </div>
        </Modal>

        <Modal open={addNewOpen} onClose={() => setAddNewOpen(false)} title="Add New Template">
          <div className="text-gray-700">Add new template form coming soon.</div>
        </Modal>

        <Modal open={!!useTemplate} onClose={() => setUseTemplate(null)} title={useTemplate?.name ? `Use: ${useTemplate.name}` : 'Use Template'}>
          <div className="text-gray-700 mb-4">Start using this template.</div>
          <div className="mt-4 flex justify-end space-x-2">
            <button 
              onClick={() => setUseTemplate(null)} 
              className="px-3 py-1.5 bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={() => { setUseTemplate(null); navigate('/upload'); }} 
              className="px-3 py-1.5 bg-blue-600 text-white rounded"
            >
              Insert into Upload
            </button>
          </div>
        </Modal>

        <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
          <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {previewMessage?.body}
          </div>
        </Modal>
      </div>
    </div>
  );
}