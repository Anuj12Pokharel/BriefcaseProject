import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash } from 'lucide-react';

export default function ManageContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Array<any>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<{name:string;email:string;designation:string}>({ name: '', email: '', designation: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('contacts');
      const arr = raw ? JSON.parse(raw) : [];
      setContacts(arr);
    } catch (e) { setContacts([]); }
  }, []);

  const saveContacts = (list: any[]) => {
    try {
      localStorage.setItem('contacts', JSON.stringify(list));
      setContacts(list);
    } catch (e) { console.error(e); }
  };

  const handleAdd = () => {
    if (!newContact.name.trim() || !newContact.email.trim()) return;
    const id = `c_${Date.now()}`;
    const list = [...contacts, { id, ...newContact }];
    saveContacts(list);
    setNewContact({ name: '', email: '', designation: '' });
  };

  const handleDelete = (id: string) => {
    const list = contacts.filter(c => c.id !== id);
    saveContacts(list);
  };

  const handleSaveEdit = (id: string, data: any) => {
    const list = contacts.map(c => c.id === id ? { ...c, ...data } : c);
    saveContacts(list);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Manage Contacts</h1>
          <div>
            <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-100">Back</button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Add Contact</h3>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <input placeholder="Full name" value={newContact.name} onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))} className="px-3 py-2 border rounded" />
            <input placeholder="Email" value={newContact.email} onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))} className="px-3 py-2 border rounded" />
            <input placeholder="Designation" value={newContact.designation} onChange={(e) => setNewContact(prev => ({ ...prev, designation: e.target.value }))} className="px-3 py-2 border rounded" />
          </div>
          <div>
            <button onClick={handleAdd} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"><Plus className="h-4 w-4 mr-2"/> Add Contact</button>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Saved Contacts</h3>
          {contacts.length === 0 ? (
            <div className="text-sm text-gray-500">No contacts yet.</div>
          ) : (
            <div className="space-y-3">
              {contacts.map(c => (
                <div key={c.id} className="p-3 border border-gray-100 rounded-md flex items-start justify-between">
                  <div className="w-3/4">
                    {editingId === c.id ? (
                      <div className="space-y-2">
                        <input defaultValue={c.name} className="px-3 py-2 border rounded w-full" onChange={(e) => c.name = e.target.value} />
                        <input defaultValue={c.email} className="px-3 py-2 border rounded w-full" onChange={(e) => c.email = e.target.value} />
                        <input defaultValue={c.designation} className="px-3 py-2 border rounded w-full" onChange={(e) => c.designation = e.target.value} />
                        <div className="space-x-2">
                          <button onClick={() => handleSaveEdit(c.id, c)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-100 rounded text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-sm text-gray-600">{c.email} • {c.designation}</div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button onClick={() => setEditingId(c.id)} className="px-2 py-1 bg-gray-100 rounded text-sm inline-flex items-center"><Pencil className="h-4 w-4 mr-1"/>Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="px-2 py-1 bg-red-100 rounded text-sm inline-flex items-center"><Trash className="h-4 w-4 mr-1"/>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
