import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocument } from '../context/DocumentContext';

type DocTemplate = { id: string; name: string; description?: string; category?: string; downloads?: number; popular?: boolean };

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
  const [previewTemplate, setPreviewTemplate] = useState<DocTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState<{ title: string; body: string } | null>(null);

  const templates = useMemo<DocTemplate[]>(() => [
    { id: 'tpl-1', name: 'Simple Agreement', description: 'A basic agreement template.', category: 'Agreements', downloads: 1234, popular: true },
    { id: 'tpl-2', name: 'Invoice', description: 'Standard invoice template.', category: 'Finance', downloads: 432, popular: false },
  ], []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[]))], [templates]);

  const [messageTemplates, setMessageTemplates] = useState<Array<{ id: string; title: string; body: string; updatedAt?: number }>>(() => {
    try {
      const raw = localStorage.getItem('messageTemplates');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'messageTemplates') {
        try { const raw = localStorage.getItem('messageTemplates'); setMessageTemplates(raw ? JSON.parse(raw) : []); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const insertMessageToUpload = (body?: string) => {
    if (!body) return;
    setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + body : body }));
    navigate('/upload');
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <label className="block text-lg font-bold">TEMPLATES</label>
        <select value={templateType} onChange={(e) => setTemplateType(e.target.value as any)} className="mt-2 px-3 py-2 border rounded">
          <option value="document">1. DOCUMENT</option>
          <option value="message">2. MESSAGE</option>
        </select>
      </div>

      {templateType === 'document' && (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="p-4 bg-white rounded shadow">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.description}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigate('/upload')} className="px-3 py-1 bg-blue-600 text-white rounded">Use</button>
                <button onClick={() => setPreviewTemplate(t)} className="px-3 py-1 border rounded">Preview</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {templateType === 'message' && isAdmin && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold mb-2">Message Templates</h3>
            <button onClick={() => navigate('/manage-templates')} className="text-sm text-blue-600">Manage Message Templates</button>
          </div>
          {messageTemplates.length === 0 ? <div className="text-sm text-gray-500">No templates</div> : (
            <div className="space-y-2">
              {messageTemplates.map(m => (
                <div key={m.id} className="p-3 bg-white rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-sm text-gray-500">{m.updatedAt ? new Date(m.updatedAt).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewMessage({ title: m.title, body: m.body })} className="px-2 py-1 border rounded">Preview</button>
                    <button onClick={() => insertMessageToUpload(m.body)} className="px-2 py-1 bg-blue-600 text-white rounded">Insert</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name}>
        <div>Preview content coming soon.</div>
      </Modal>

      <Modal open={!!previewMessage} onClose={() => setPreviewMessage(null)} title={previewMessage?.title}>
        <div className="whitespace-pre-wrap">{previewMessage?.body}</div>
      </Modal>
    </div>
  );
}
