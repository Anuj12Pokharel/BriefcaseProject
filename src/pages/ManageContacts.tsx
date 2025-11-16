import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash, Upload } from 'lucide-react';

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

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [googleImportStatus, setGoogleImportStatus] = useState<string | null>(null);
  const [isGoogleImporting, setIsGoogleImporting] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(l => l.split(',').map(cell => cell.trim()));

    const idx: any = {
      name: headers.findIndex(h => /name|full name|fullname/.test(h)),
      email: headers.findIndex(h => /email|e-mail/.test(h)),
      designation: headers.findIndex(h => /title|company|organization|job|role/.test(h)),
    };

    // Fallbacks
    if (idx.name === -1) idx.name = 0;
    if (idx.email === -1) idx.email = 1;
    if (idx.designation === -1) idx.designation = 2;

    const parsed: Array<any> = [];
    rows.forEach((r) => {
      const name = r[idx.name] || '';
      const email = r[idx.email] || '';
      const designation = r[idx.designation] || '';
      if (!email) return; // skip if no email
      parsed.push({ name, email, designation });
    });
    return parsed;
  };

  const handleImport = (file?: File) => {
    setImportStatus(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) { setImportStatus('No valid contacts found in file.'); return; }
        const now = Date.now();
        const newContacts = parsed.map((c, i) => ({ id: `imp_${now}_${i}`, ...c }));
        const merged = [...contacts, ...newContacts];
        saveContacts(merged);
        setImportStatus(`Imported ${newContacts.length} contacts.`);
      } catch (err) {
        setImportStatus('Failed to parse file. Make sure it is a CSV export from Google Contacts.');
      }
    };
    reader.readAsText(file);
  };

  // GOOGLE OAUTH + PEOPLE API IMPORT
  const startGoogleImport = () => {
    setGoogleImportStatus(null);
    const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
    if (!googleClientId) { setGoogleImportStatus('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your .env.'); return; }

    const redirectUri = `${location.origin}/oauth2-redirect.html`;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/contacts.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=consent`;

    const width = 520; const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const popup = window.open(authUrl, 'google_oauth_popup', `width=${width},height=${height},left=${left},top=${top}`);
    if (!popup) { setGoogleImportStatus('Popup blocked. Allow popups and try again.'); return; }

    setIsGoogleImporting(true);

    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== location.origin) return;
      const hash = String(e.data || '');
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const token = params.get('access_token');
      if (!token) { setGoogleImportStatus('Authorization failed or no token received.'); setIsGoogleImporting(false); return; }

      try {
        setGoogleImportStatus('Fetching contacts from Google...');
        const resp = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations&pageSize=2000', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || 'Failed to fetch contacts');
        }
        const data = await resp.json();
        const conns = data.connections || [];
        const parsed = conns.map((c: any) => {
          const name = c.names?.[0]?.displayName || '';
          const email = c.emailAddresses?.[0]?.value || '';
          const designation = c.organizations?.[0]?.title || c.organizations?.[0]?.name || '';
          if (!email) return null;
          return { name, email, designation };
        }).filter(Boolean) as Array<any>;

        if (parsed.length === 0) {
          setGoogleImportStatus('No contacts with email addresses found.');
        } else {
          const now = Date.now();
          const newContacts = parsed.map((c, i) => ({ id: `gimp_${now}_${i}`, ...c }));
          const merged = [...contacts, ...newContacts];
          saveContacts(merged);
          setGoogleImportStatus(`Imported ${newContacts.length} contacts from Google.`);
        }
      } catch (err: any) {
        setGoogleImportStatus(`Import failed: ${err?.message || err}`);
      } finally {
        setIsGoogleImporting(false);
        try { popup.close(); } catch (e) {}
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
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
            <div className="flex items-center space-x-3">
              <button onClick={handleAdd} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"><Plus className="h-4 w-4 mr-2"/> Add Contact</button>
              <button onClick={startGoogleImport} disabled={isGoogleImporting} className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${isGoogleImporting ? 'bg-gray-200 text-gray-600' : 'bg-green-600 text-white'}`}>
                {isGoogleImporting ? 'Importing...' : <><Upload className="h-4 w-4 mr-2"/>Import Contacts</>}
              </button>
            </div>
            {googleImportStatus && <div className="text-sm mt-2 text-gray-700">{googleImportStatus}</div>}
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
