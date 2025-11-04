import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Eye, Star } from 'lucide-react';
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

function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose?: () => void; children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      import React, { useEffect, useMemo, useState } from 'react';
      import { FileText, Download, Eye, Star } from 'lucide-react';
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

      function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose?: () => void; children?: React.ReactNode }) {
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

        const [templates] = useState<DocTemplate[]>([
          { id: 'tpl-1', name: 'Simple Agreement', description: 'A basic agreement template.', category: 'Agreements', downloads: 1234, popular: true },
          { id: 'tpl-2', name: 'Invoice', description: 'Standard invoice template.', category: 'Finance', downloads: 432, popular: false },
        ]);

        const categories = useMemo(() => ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[]))], [templates]);

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

        // Modal & action state
        const [previewTemplate, setPreviewTemplate] = useState<DocTemplate | null>(null);
        const [previewMessage, setPreviewMessage] = useState<{ title: string; body: string } | null>(null);
        const [addNewOpen, setAddNewOpen] = useState(false);
        const [useTemplate, setUseTemplate] = useState<DocTemplate | null>(null);

        const insertMessageToUpload = (body?: string) => {
          if (!body) return;
          setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + body : body }));
          navigate('/upload');
        };

        return (
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="block text-lg font-bold text-gray-900 mb-2">TEMPLATES</label>
                  <select value={templateType} onChange={e => setTemplateType(e.target.value as 'document' | 'message')} className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="document">1. DOCUMENT</option>
                    <option value="message">2. MESSAGE</option>
                  </select>
                </div>

                {isAdmin && (
                  <button onClick={() => navigate('/manage-templates')} className="ml-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                    Manage Message Templates
                  </button>
                )}
              </div>

              {templateType === 'document' && (
                <>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {categories.map((category) => (
                      <button key={category} className={`px-4 py-2 rounded-lg font-medium transition-colors ${category === 'All' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map((template) => (
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
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">{template.category}</span>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                            <span className="flex items-center space-x-1">
                              <Download className="h-4 w-4" />
                              <span>{(template.downloads || 0).toLocaleString()}</span>
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => setUseTemplate(template)}>Use Template</button>
                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Preview" onClick={() => setPreviewTemplate(template)}><Eye className="h-5 w-5 text-gray-600" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {templateType === 'message' && isAdmin && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Templates</h2>
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
                      <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Message Templates</button>
                    </div>

                    <div className="space-y-3">
                      {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
                      {messageTemplates.map((t) => (
                        <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{t.title}</div>
                            <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                            <button onClick={() => insertMessageToUpload(t.body)} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                            <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="fixed bottom-8 right-8 z-50">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span>Add New Template</span>
                </button>
              </div>

              <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name ? `Preview: ${previewTemplate.name}` : 'Preview'}>
                <div className="text-gray-700">Template preview coming soon.</div>
              </Modal>

              <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
                <div className="text-gray-700 whitespace-pre-wrap">{previewMessage?.body}</div>
              </Modal>

              <Modal open={addNewOpen} onClose={() => setAddNewOpen(false)} title="Add New Template">
                <div className="text-gray-700">Add new template form coming soon.</div>
              </Modal>

              <Modal open={!!useTemplate} onClose={() => setUseTemplate(null)} title={useTemplate?.name ? `Use: ${useTemplate.name}` : 'Use Template'}>
                <div className="text-gray-700">Start using this template.</div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button onClick={() => setUseTemplate(null)} className="px-3 py-1.5 bg-gray-100 rounded">Cancel</button>
                  <button onClick={() => { setUseTemplate(null); navigate('/upload'); }} className="px-3 py-1.5 bg-blue-600 text-white rounded">Insert into Upload</button>
                </div>
              </Modal>
            </div>
          </div>
        );
      }
}

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { setFieldValues } = useDocument();

  const [templateType, setTemplateType] = useState<'document' | 'message'>('document');

  const [templates] = useState<DocTemplate[]>([
    { id: 'tpl-1', name: 'Simple Agreement', description: 'A basic agreement template.', category: 'Agreements', downloads: 1234, popular: true },
    { id: 'tpl-2', name: 'Invoice', description: 'Standard invoice template.', category: 'Finance', downloads: 432, popular: false },
  ]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[]))], [templates]);

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

  const [previewTemplate, setPreviewTemplate] = useState<DocTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState<{ title: string; body: string } | null>(null);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [useTemplate, setUseTemplate] = useState<DocTemplate | null>(null);

  const insertMessageToUpload = (body?: string) => {
    if (!body) return;
    setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + body : body }));
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="block text-lg font-bold text-gray-900 mb-2">TEMPLATES</label>
            <select value={templateType} onChange={e => setTemplateType(e.target.value as 'document' | 'message')} className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="document">1. DOCUMENT</option>
              <option value="message">2. MESSAGE</option>
            </select>
          </div>

          {isAdmin && (
            <button onClick={() => navigate('/manage-templates')} className="ml-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
              Manage Message Templates
            </button>
          )}
        </div>

        {templateType === 'document' && (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button key={category} className={`px-4 py-2 rounded-lg font-medium transition-colors ${category === 'All' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
                  {category}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
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
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">{template.category}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                      <span className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{(template.downloads || 0).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => setUseTemplate(template)}>Use Template</button>
                      <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Preview" onClick={() => setPreviewTemplate(template)}><Eye className="h-5 w-5 text-gray-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {templateType === 'message' && isAdmin && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Templates</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
                <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Message Templates</button>
              </div>

              <div className="space-y-3">
                {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
                {messageTemplates.map((t) => (
                  <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button onClick={() => insertMessageToUpload(t.body)} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                      <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-8 right-8 z-50">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Add New Template</span>
          </button>
        </div>

        <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name ? `Preview: ${previewTemplate.name}` : 'Preview'}>
          <div className="text-gray-700">Template preview coming soon.</div>
        </Modal>

        <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
          <div className="text-gray-700 whitespace-pre-wrap">{previewMessage?.body}</div>
        </Modal>

      </div>
    </div>
  );
}

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

  // Document templates (stubbed)
  const [templates] = useState<DocTemplate[]>([
    { id: 'tpl-1', name: 'Simple Agreement', description: 'A basic agreement template.', category: 'Agreements', downloads: 1234, popular: true },
    { id: 'tpl-2', name: 'Invoice', description: 'Standard invoice template.', category: 'Finance', downloads: 432, popular: false },
  ]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[]))], [templates]);

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

  // Modal & action state
  const [previewTemplate, setPreviewTemplate] = useState<DocTemplate | null>(null);
  const [cloneTemplate, setCloneTemplate] = useState<DocTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<DocTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<DocTemplate | null>(null);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [useTemplate, setUseTemplate] = useState<DocTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState<{ title: string; body: string } | null>(null);

  const insertMessageToUpload = (body?: string) => {
    if (!body) return;
    setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + body : body }));
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <label className="block text-lg font-bold text-gray-900 mb-2">TEMPLATES</label>
          <select value={templateType} onChange={e => setTemplateType(e.target.value as 'document' | 'message')} className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="document">1. DOCUMENT</option>
            <option value="message">2. MESSAGE</option>
          </select>
        </div>

        {templateType === 'document' && (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button key={category} className={`px-4 py-2 rounded-lg font-medium transition-colors ${category === 'All' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
                  {category}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
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
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">{template.category}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                      <span className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{(template.downloads || 0).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => setUseTemplate(template)}>Use Template</button>
                      <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Preview" onClick={() => setPreviewTemplate(template)}><Eye className="h-5 w-5 text-gray-600" /></button>
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {templateType === 'message' && isAdmin && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Templates</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
                <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Message Templates</button>
              </div>

              <div className="space-y-3">
                {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
                {messageTemplates.map((t) => (
                  <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button onClick={() => insertMessageToUpload(t.body)} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                      <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Add New */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Add New Template</span>
          </button>
        </div>

        {/* Modals (simple local modal wrapper) */}
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
          <div className="flex justify-end space-x-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors" onClick={() => setDeleteTemplate(null)}>Delete</button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" onClick={() => setDeleteTemplate(null)}>Cancel</button>
          </div>
        </Modal>
        <Modal open={addNewOpen} onClose={() => setAddNewOpen(false)} title="Add New Template">
          <div className="text-gray-700">Add new template form coming soon.</div>
        </Modal>
        <Modal open={!!useTemplate} onClose={() => setUseTemplate(null)} title={useTemplate?.name ? `Use: ${useTemplate.name}` : 'Use Template'}>
          <div className="text-gray-700">Start using this template.</div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => setUseTemplate(null)} className="px-3 py-1.5 bg-gray-100 rounded">Cancel</button>
            <button onClick={() => { setUseTemplate(null); navigate('/upload'); }} className="px-3 py-1.5 bg-blue-600 text-white rounded">Insert into Upload</button>
          </div>
        </Modal>

        <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
          <div className="text-gray-700 whitespace-pre-wrap">{previewMessage?.body}</div>
        </Modal>
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Eye, Star } from 'lucide-react';
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

function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose?: () => void; children?: React.ReactNode }) {
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

  // Document templates (stubbed/simple list). You can replace this with a fetch later.
  const [templates] = useState<DocTemplate[]>([
    { id: 'tpl-1', name: 'Simple Agreement', description: 'A basic agreement template.', category: 'Agreements', downloads: 1234, popular: true },
    { id: 'tpl-2', name: 'Invoice', description: 'Standard invoice template.', category: 'Finance', downloads: 432, popular: false },
  ]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[]))], [templates]);

  // Message templates stored in localStorage (like ManageTemplates)
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

  // Modal & action state
  const [previewTemplate, setPreviewTemplate] = useState<DocTemplate | null>(null);
  const [cloneTemplate, setCloneTemplate] = useState<DocTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<DocTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<DocTemplate | null>(null);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [useTemplate, setUseTemplate] = useState<DocTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState<{ title: string; body: string } | null>(null);

  const insertMessageToUpload = (body?: string) => {
    if (!body) return;
    setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + body : body }));
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <label className="block text-lg font-bold text-gray-900 mb-2">TEMPLATES</label>
          <select value={templateType} onChange={e => setTemplateType(e.target.value as 'document' | 'message')} className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="document">1. DOCUMENT</option>
            <option value="message">2. MESSAGE</option>
          </select>
        </div>

        {templateType === 'document' && (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button key={category} className={`px-4 py-2 rounded-lg font-medium transition-colors ${category === 'All' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
                  {category}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
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
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">{template.category}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                      <span className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{(template.downloads || 0).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => setUseTemplate(template)}>Use Template</button>
                      <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Preview" onClick={() => setPreviewTemplate(template)}><Eye className="h-5 w-5 text-gray-600" /></button>
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {templateType === 'message' && isAdmin && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Templates</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
                <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Message Templates</button>
              </div>

              <div className="space-y-3">
                {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
                {messageTemplates.map((t) => (
                  <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button onClick={() => insertMessageToUpload(t.body)} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                      <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Add New */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Add New Template</span>
          </button>
        </div>

        {/* Modals (simple local modal wrapper) */}
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
          <div className="flex justify-end space-x-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors" onClick={() => setDeleteTemplate(null)}>Delete</button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" onClick={() => setDeleteTemplate(null)}>Cancel</button>
          </div>
        </Modal>
        <Modal open={addNewOpen} onClose={() => setAddNewOpen(false)} title="Add New Template">
          <div className="text-gray-700">Add new template form coming soon.</div>
        </Modal>
        <Modal open={!!useTemplate} onClose={() => setUseTemplate(null)} title={useTemplate?.name ? `Use: ${useTemplate.name}` : 'Use Template'}>
          <div className="text-gray-700">Start using this template.</div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => setUseTemplate(null)} className="px-3 py-1.5 bg-gray-100 rounded">Cancel</button>
            <button onClick={() => { setUseTemplate(null); navigate('/upload'); }} className="px-3 py-1.5 bg-blue-600 text-white rounded">Insert into Upload</button>
          </div>
        </Modal>

        <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
          <div className="text-gray-700 whitespace-pre-wrap">{previewMessage?.body}</div>
        </Modal>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Search, Filter, FileText, Download, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <>
          {/* Dropdown for template type */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-900 mb-2">TEMPLATES</label>
            <select
              value={templateType}
              onChange={e => setTemplateType(e.target.value as 'document' | 'message')}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="document">1. DOCUMENT</option>
              <option value="message">2. MESSAGE</option>
            </select>
          </div>

          {/* Document Templates Section */}
          {templateType === 'document' && (
            <>
              <div className="flex flex-wrap gap-3 mb-8">
                {categories.map((category) => (
                  <button key={category} className={`px-4 py-2 rounded-lg font-medium transition-colors ${category === 'All' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => (
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
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">{template.category}</span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                        <span className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{template.downloads.toLocaleString()}</span>
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => setUseTemplate(template)}>Use Template</button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Preview" onClick={() => setPreviewTemplate(template)}><Eye className="h-5 w-5 text-gray-600" /></button>
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
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Message Templates Section (admin only) */}
          {templateType === 'message' && isAdmin && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Templates</h2>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
                  <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Message Templates</button>
                </div>

                <div className="space-y-3">
                  {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
                  {messageTemplates.map((t) => (
                    <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{t.title}</div>
                        <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button onClick={() => {
                          setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + (t.body || '') : (t.body || '') }));
                          navigate('/upload');
                        }} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                        <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Floating Add New */}
          <div className="fixed bottom-8 right-8 z-50">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span>Add New Template</span>
            </button>
          </div>

          {/* Modals */}
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
                setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + (useTemplate?.description || '') : (useTemplate?.description || '') }));
                setUseTemplate(null);
                navigate('/upload');
              }} className="px-3 py-1.5 bg-blue-600 text-white rounded">Insert into Upload</button>
            </div>
          </Modal>

          <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
            <div className="text-gray-700 whitespace-pre-wrap">{previewMessage?.body}</div>
          </Modal>
        </>
      </div>
    </div>
  );
              <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
              <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Templates</button>
            </div>

            <div className="space-y-3">
              {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
              {messageTemplates.map((t) => (
                <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => {
                      setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + (t.body || '') : (t.body || '') }));
                      navigate('/upload');
                    }} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                    <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {/* Message Templates (from ManageTemplates) - only for admin */}
        {isAdmin && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Templates</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Insert pre-written message templates into your Upload message.</div>
                <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Templates</button>
              </div>

              <div className="space-y-3">
                {messageTemplates.length === 0 && <div className="text-sm text-gray-500">No message templates yet</div>}
                {messageTemplates.map((t) => (
                  <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button title="Preview" onClick={() => setPreviewMessage({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button onClick={() => {
                        setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + (t.body || '') : (t.body || '') }));
                        navigate('/upload');
                      }} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                      <button onClick={() => navigate('/manage-templates')} className="ml-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        

        {/* Floating Add New */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors font-semibold text-lg" onClick={() => setAddNewOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Add New Template</span>
          </button>
        </div>

        {/* Modals */}
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
              setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + (useTemplate?.description || '') : (useTemplate?.description || '') }));
              setUseTemplate(null);
              navigate('/upload');
            }} className="px-3 py-1.5 bg-blue-600 text-white rounded">Insert into Upload</button>
          </div>
        </Modal>

        <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title || 'Preview Message'}>
          <div className="text-gray-700 whitespace-pre-wrap">{previewMessage?.body}</div>
        </Modal>
      </div>
    </div>
  );
}
// ...existing code...
