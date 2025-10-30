import { useState, useEffect } from 'react';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Stepper from '../components/Stepper';
import { useDocument } from '../context/DocumentContext';

interface Recipient {
  id: number;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

export default function Send() {
  const navigate = useNavigate();
  const { uploadedDoc, fields, fieldValues, setFieldValues } = useDocument();

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, name: '', email: '', role: 'Signer', designation: '' }
  ]);
  const [message, setMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(false);
  const [expiryDays, setExpiryDays] = useState('30');
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Hierarchy signing option (single checkbox for the whole document)
  const [signInHierarchy, setSignInHierarchy] = useState(false);

  // Initialize message from DocumentContext once on mount (avoid two-way loop)
  useEffect(() => {
    try {
      const ctxMessage = (fieldValues && fieldValues.messageToRecipients) || '';
      if (ctxMessage !== message) setMessage(ctxMessage);
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRecipient = () => setRecipients(prev => [...prev, { id: Date.now(), name: '', email: '', role: 'Signer', designation: '' }]);
  const removeRecipient = (id: number) => { if (recipients.length > 1) setRecipients(prev => prev.filter(r => r.id !== id)); };
  const updateRecipient = (id: number, field: keyof Recipient, value: string) => setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Stepper steps={["Upload", "Prepare", "Send"]} currentStep={3} />
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Prepare</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Send Document</h1>
          <p className="text-lg text-gray-600">Add recipients and send for signature</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
              <button onClick={addRecipient} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="h-5 w-5" />
                <span>Add Recipient</span>
              </button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={recipient.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-2">{index + 1}</div>
                  <div className="flex-1 grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" value={recipient.name} onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input type="email" value={recipient.email} onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select value={recipient.role} onChange={(e) => updateRecipient(recipient.id, 'role', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="Signer">Signer</option>
                        <option value="Approver">Approver</option>
                        <option value="CC">CC</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                      <input type="text" value={recipient.designation || ''} onChange={(e) => updateRecipient(recipient.id, 'designation', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    {/* per-recipient hierarchy removed - use single global hierarchy checkbox below */}
                  </div>
                  {recipients.length > 1 && (
                    <button onClick={() => removeRecipient(recipient.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-8">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Message</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
              <input type="text" defaultValue="Please sign: Document" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Message to Recipients</label>
                {!editingMessage ? (
                  <button onClick={() => setEditingMessage(true)} className="text-sm text-blue-600">Edit</button>
                ) : (
                  <div className="space-x-2">
                    <button onClick={() => {
                      // save to context and exit edit mode
                      try {
                        setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: message }));
                      } catch (e) {}
                      setEditingMessage(false);
                    }} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
                    <button onClick={() => {
                      // cancel edits and restore from context
                      const ctx = (fieldValues && fieldValues.messageToRecipients) || '';
                      setMessage(ctx);
                      setEditingMessage(false);
                    }} className="px-3 py-1 bg-gray-100 rounded text-sm">Cancel</button>
                  </div>
                )}
              </div>

              {!editingMessage ? (
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 whitespace-pre-wrap" style={{ minHeight: 96 }}>
                  {message || 'No message provided.'}
                </div>
              ) : (
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none" />
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Options</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Expiry</label>
                <select value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-7">
                <input type="checkbox" id="reminder" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="reminder" className="text-sm font-medium text-gray-700">Send reminder emails every 3 days</label>
              </div>
            </div>
            <div className="mt-4">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={signInHierarchy} onChange={(e) => setSignInHierarchy(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded" />
                <span className="ml-3 text-sm font-medium text-gray-700">Sign in hierarchy order</span>
              </label>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-4">Final signed document preview is not shown on this page. Proceed to your dashboard or email for confirmation after sending.</div>
          <div className="mt-6 flex items-center justify-end space-x-3">
            {sendError && <div className="text-sm text-red-600 mr-auto">{sendError}</div>}
            {sent ? (
              <div className="text-sm text-green-600 mr-auto">Document sent ✔️</div>
            ) : null}
            <button
              onClick={() => {
                // validate recipients: at least one with name+valid email
                setSendError(null);
                const valid = recipients.filter(r => r.name.trim() && r.email.trim() && isValidEmail(r.email));
                if (valid.length === 0) {
                  setSendError('Please add at least one recipient with a valid name and email before sending.');
                  return;
                }
                // build payload
                const payload = {
                  recipients: recipients,
                  message: message,
                  expiryDays,
                  signInHierarchy,
                  fields,
                  fieldValues,
                  document: uploadedDoc,
                } as const;
                setSending(true);
                // simulate network send
                setTimeout(() => {
                  console.log('Simulated send payload:', payload);
                  setSending(false);
                  setSent(true);
                  try { setFieldValues((prev: Record<string, any>) => ({ ...prev, lastSentAt: Date.now() })); } catch (e) {}
                }, 900);
              }}
              disabled={sending || sent}
              className={`px-4 py-2 rounded-md text-white ${sending || sent ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {sending ? 'Sending…' : sent ? 'Sent' : 'Send Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
