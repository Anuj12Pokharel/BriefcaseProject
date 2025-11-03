import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../context/DocumentContext';
import { Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';

function timeAgo(when?: number) {
  if (!when) return 'unknown';
  const seconds = Math.floor((Date.now() - when) / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function ManageTemplates() {
  const navigate = useNavigate();
  const { setFieldValues } = useDocument();

  const [templates, setTemplates] = useState<Array<{ id: string; title: string; body: string; updatedAt?: number }>>(() => {
    try {
      const raw = localStorage.getItem('messageTemplates');
      const base = raw ? JSON.parse(raw) : [];
      return base.map((t: any) => ({ ...t, updatedAt: t.updatedAt || Date.now() }));
    } catch (e) {
      return [];
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState<{ title: string; body: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');

  useEffect(() => {
    // reload templates if storage changed elsewhere
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'messageTemplates') {
        try {
          const raw = localStorage.getItem('messageTemplates');
          const parsed = raw ? JSON.parse(raw) : [];
          setTemplates(parsed.map((t: any) => ({ ...t, updatedAt: t.updatedAt || Date.now() })));
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = (next: any) => {
    setTemplates(next);
    localStorage.setItem('messageTemplates', JSON.stringify(next));
  };

  const addNewTemplate = () => {
    const id = `tpl-${Date.now()}`;
    const newTpl = { id, title: modalTitle || 'Untitled', body: modalBody || '', updatedAt: Date.now() };
    const next = [newTpl, ...templates];
    persist(next);
    setModalTitle('');
    setModalBody('');
    setShowAddModal(false);
  };

  const save = () => {
    if (editingId) {
      const next = templates.map(t => t.id === editingId ? { ...t, title: title || 'Untitled', body: body || '', updatedAt: Date.now() } : t);
      persist(next);
      setEditingId(null);
      setTitle('');
      setBody('');
    } else {
      const id = `tpl-${Date.now()}`;
      const newTpl = { id, title: title || 'Untitled', body: body || '', updatedAt: Date.now() };
      persist([newTpl, ...templates]);
      setTitle('');
      setBody('');
    }
  };

  const remove = (id: string) => {
    const next = templates.filter(t => t.id !== id);
    persist(next);
  };

  const insertToMessage = (tplBody: string) => {
    // set message in DocumentContext and navigate back to upload
    setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: prev.messageToRecipients ? prev.messageToRecipients + '\n\n' + tplBody : tplBody }));
    navigate('/upload');
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setTitle(t.title || '');
    setBody(t.body || '');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Message Templates</h1>
            <p className="text-sm text-gray-500">Create, edit or delete templates. Insert a template into your Upload message.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Message Templates</h3>
            <div className="mb-4">
              <button onClick={() => { setModalTitle(''); setModalBody(''); setShowAddModal(true); }} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Add Template</button>
            </div>
            <div className="space-y-3">
              {templates.length === 0 && <div className="text-sm text-gray-500">No templates yet</div>}
              {templates.map(t => (
                <div key={t.id} className="p-3 border rounded-md flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500">{timeAgo(t.updatedAt)}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button title="Preview" onClick={() => setPreview({ title: t.title, body: t.body })} className="p-2 rounded-md hover:bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button title="Edit" onClick={() => startEdit(t)} className="p-2 rounded-md hover:bg-gray-100">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </button>
                    <button title="Delete" onClick={() => remove(t.id)} className="p-2 rounded-md hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                    <button onClick={() => insertToMessage(t.body)} className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Insert</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Template' : 'Template Preview / Editor'}</h3>
            <div className="space-y-3">
              {editingId ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Body</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none" />
                  <div className="flex items-center justify-end space-x-3 mt-3">
                    <button onClick={() => { setEditingId(null); setTitle(''); setBody(''); }} className="px-4 py-2 bg-gray-100 rounded-md text-sm">Cancel</button>
                    <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Update</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Select a template on the left to preview or click Add Template to create a new one.</div>
                  {preview ? (
                    <div>
                      <h4 className="font-semibold text-gray-900">Preview: {preview.title}</h4>
                      <div className="mt-2 p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap text-gray-800">{preview.body}</div>
                      <div className="mt-3">
                        <button onClick={() => insertToMessage(preview.body)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm mr-2">Insert</button>
                        <button onClick={() => setPreview(null)} className="px-3 py-1.5 bg-gray-100 rounded text-sm">Close</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No template selected.</div>
                  )}
                </div>
              )}
            </div>

            {preview && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-900">Preview: {preview.title}</h4>
                <div className="mt-2 p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap text-gray-800">{preview.body}</div>
                <div className="mt-3">
                  <button onClick={() => insertToMessage(preview.body)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm mr-2">Insert</button>
                  <button onClick={() => setPreview(null)} className="px-3 py-1.5 bg-gray-100 rounded text-sm">Close</button>
                </div>
              </div>
            )}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-30 z-40" onClick={() => setShowAddModal(false)} />
              <div className="bg-white rounded-lg shadow-lg relative z-50 w-full max-w-2xl p-6">
                <h3 className="text-lg font-semibold mb-3">Add Template</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input value={modalTitle} onChange={e => setModalTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                    <textarea value={modalBody} onChange={e => setModalBody(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none" />
                  </div>
                  <div className="flex items-center justify-end space-x-3">
                    <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 rounded-md text-sm">Cancel</button>
                    <button onClick={addNewTemplate} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
