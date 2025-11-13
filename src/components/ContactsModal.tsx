import { useEffect, useState } from 'react';
import { useDocument } from '../context/DocumentContext';
import { X, CheckCircle2 } from 'lucide-react';

export default function ContactsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { recipients, setRecipients } = useDocument();
  const [contacts, setContacts] = useState<Array<any>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem('contacts');
      const arr = raw ? JSON.parse(raw) : [];
      setContacts(arr);
    } catch (e) { setContacts([]); }
  }, [isOpen]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkInsert = () => {
    if (selectedIds.size === 0) return;
    const already = new Set((recipients || []).map(r => r.email));
    const toAdd = contacts.filter(c => selectedIds.has(c.id) && !already.has(c.email));
    if (toAdd.length === 0) { onClose(); return; }
    const now = Date.now();
    const newRecipients = toAdd.map((c, idx) => ({ id: `r_${now}_${idx}`, name: c.name, email: c.email, designation: c.designation }));
    setRecipients([...(recipients || []), ...newRecipients]);
    onClose();
    setSelectedIds(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl mx-4 p-6 shadow-lg z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Contacts</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkInsert}
              disabled={selectedIds.size === 0}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedIds.size === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Insert
            </button>
            <button onClick={() => { onClose(); window.open('/manage-contacts', '_blank'); }} className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm">Manage</button>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close contacts modal">
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="text-sm text-gray-500">No contacts found. Use Manage contacts to add one.</div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {contacts.map(c => {
              const checked = selectedIds.has(c.id);
              const checkboxId = `contact-${c.id}`;
              return (
                <label
                  key={c.id}
                  htmlFor={checkboxId}
                  className={`p-3 border rounded-md flex items-center justify-between cursor-pointer transition-colors ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(c.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                      <div className="text-sm text-gray-600 truncate">{c.email} {c.designation ? `• ${c.designation}` : ''}</div>
                    </div>
                  </div>
                  {checked && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" aria-label="Selected" />
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
