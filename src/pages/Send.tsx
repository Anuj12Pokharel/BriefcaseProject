import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Stepper from '../components/Stepper';
import { useDocument } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';

export default function Send() {
  const navigate = useNavigate();
  const { uploadedDoc, fields, fieldValues, setFieldValues, recipients, setRecipients } = useDocument();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(false);
  const [expiryDays, setExpiryDays] = useState('30');
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Hierarchy signing option (single checkbox for the whole document)
  const [signInHierarchy, setSignInHierarchy] = useState(false);
  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(true);
  // Reminder amount and unit (sender can choose 1-20 before the selected unit)
  const [reminderAmount, setReminderAmount] = useState<number>(1);
  const [reminderUnit, setReminderUnit] = useState<'hours' | 'days' | 'weeks'>('days');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemNode = useRef<HTMLElement | null>(null);

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

  // recipients are managed in Upload (DocumentContext). Send shows a read-only summary.

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
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
                {/* Need hierarchy option at top visible to admins — render as a Yes/No choice */}
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <span className="font-semibold">Sign in hierarchy order?</span>
                    <div className="inline-flex items-center rounded-md bg-gray-100 p-1">
                      <button
                        onClick={() => setSignInHierarchy(true)}
                        aria-pressed={signInHierarchy}
                        className={`${signInHierarchy ? 'bg-blue-600 text-white' : 'text-gray-700'} px-3 py-1 rounded-md text-sm font-medium`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setSignInHierarchy(false)}
                        aria-pressed={!signInHierarchy}
                        className={`${!signInHierarchy ? 'bg-blue-600 text-white' : 'text-gray-700'} ml-1 px-3 py-1 rounded-md text-sm font-medium`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">{recipients && recipients.length > 0 ? `${recipients.length} recipients` : 'No recipients'}</div>
            </div>

            <div className="space-y-2">
              {recipients && recipients.length > 0 ? (
                recipients.map((r) => {
                  // Allow admins to reorder recipients only when hierarchical signing is enabled
                  // and there is more than one recipient. If hierarchy is disabled or there
                  // are not enough recipients, ordering UI is removed.
                  const isDraggable = user?.role === 'admin' && signInHierarchy && (recipients && recipients.length > 1);
                  return (
                    <div
                      key={r.id}
                      draggable={isDraggable}
                      onDragStart={(e) => {
                        if (!isDraggable) return;
                        setDraggingId(r.id);
                        dragItemNode.current = e.currentTarget as HTMLElement;
                        e.dataTransfer?.setData('text/plain', r.id);
                        e.dataTransfer!.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        if (!isDraggable) return;
                        e.preventDefault();
                        const overId = r.id;
                        if (overId !== draggingId) setDragOverId(overId);
                      }}
                      onDragLeave={() => {
                        if (!isDraggable) return;
                        setDragOverId(null);
                      }}
                      onDrop={(e) => {
                        if (!isDraggable) return;
                        e.preventDefault();
                        const fromId = draggingId || e.dataTransfer.getData('text/plain');
                        const toId = r.id;
                        if (!fromId) return;
                        if (fromId === toId) return;
                        const list = [...recipients];
                        const fromIndex = list.findIndex(x => x.id === fromId);
                        const toIndex = list.findIndex(x => x.id === toId);
                        if (fromIndex < 0 || toIndex < 0) return;
                        const [moved] = list.splice(fromIndex, 1);
                        list.splice(toIndex, 0, moved);
                        try { setRecipients(list); } catch (err) { console.error(err); }
                        setDraggingId(null);
                        setDragOverId(null);
                        dragItemNode.current = null;
                      }}
                      className={`p-3 bg-gray-50 rounded-lg flex items-center justify-between ${dragOverId === r.id ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        {isDraggable && (
                          <div className="text-gray-400 mr-2 cursor-move">☰</div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{r.name || <span className="text-gray-500">(No name)</span>}</div>
                          <div className="text-sm text-gray-600">{r.email || <span className="text-gray-500">(No email)</span>}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{r.designation || '—'}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No recipients added. Add recipients on the Upload page.</div>
              )}
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
                <div className="flex items-center space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="reminder" className="text-sm font-medium text-gray-700">Send reminder emails</label>
                <select
                  value={reminderAmount}
                  onChange={(e) => setReminderAmount(Number(e.target.value))}
                  disabled={!reminderEnabled}
                  className="px-3 py-1 border border-gray-300 rounded mr-2"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <select
                  value={reminderUnit}
                  onChange={(e) => setReminderUnit(e.target.value as any)}
                  disabled={!reminderEnabled}
                  className="px-3 py-1 border border-gray-300 rounded"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
            {/* Sign in hierarchy checkbox moved to the Recipients header for clarity (admins only) */}
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
                  reminderEnabled,
                  reminderAmount,
                  reminderUnit,
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
                  // Navigate to thank-you / success page
                  navigate('/send/success');
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
