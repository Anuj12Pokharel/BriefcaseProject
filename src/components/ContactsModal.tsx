import { useEffect, useState } from 'react';
import { useDocument } from '../context/DocumentContext';

export default function ContactsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { recipients, setRecipients } = useDocument();
  const [contacts, setContacts] = useState<Array<any>>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('contacts');
      const arr = raw ? JSON.parse(raw) : [];
      setContacts(arr);
    } catch (e) { setContacts([]); }
  }, [isOpen]);

  const handleInsert = (c: any) => {
    const id = `r_${Date.now()}`;
    setRecipients([...(recipients || []), { id, name: c.name, email: c.email, designation: c.designation }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl mx-4 p-6 shadow-lg z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Contacts</h3>
          <div className="flex items-center space-x-3">
            <button onClick={() => { onClose(); window.open('/manage-contacts', '_blank'); }} className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm">Manage contacts</button>
            <button onClick={onClose} className="text-sm text-gray-600">Close</button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="text-sm text-gray-500">No contacts found. Use Manage contacts to add one.</div>
        ) : (
          <div className="space-y-3">
            {contacts.map(c => (
              <div key={c.id} className="p-3 border border-gray-100 rounded-md flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.email} {c.designation ? `• ${c.designation}` : ''}</div>
                </div>
                <div>
                  <button onClick={() => handleInsert(c)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Insert</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
