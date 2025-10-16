import { useState } from 'react';
import { Plus, X, Mail, ArrowLeft, Send as SendIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recipient {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Send() {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, name: '', email: '', role: 'Signer' }
  ]);
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now(), name: '', email: '', role: 'Signer' }
    ]);
  };

  const removeRecipient = (id: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  const updateRecipient = (id: number, field: string, value: string) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
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
              <button
                onClick={addRecipient}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Add Recipient</span>
              </button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div
                  key={recipient.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'name', e.target.value)
                        }
                        placeholder=""
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'email', e.target.value)
                        }
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={recipient.role}
                        onChange={(e) =>
                          updateRecipient(recipient.id, 'role', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Signer">Signer</option>
                        <option value="Approver">Approver</option>
                        <option value="CC">CC</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-8"
                    >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                defaultValue="Please sign: Document"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Add a personal message for recipients..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Options</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Expiry
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-7">
                <input
                  type="checkbox"
                  id="reminder"
                  defaultChecked
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="reminder" className="text-sm font-medium text-gray-700">
                  Send reminder emails every 3 days
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Ready to Send</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Recipients will receive an email with a secure link to review and sign the document.
                You'll be notified when they complete their action.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg">
            <SendIcon className="h-5 w-5" />
            <span>Send for Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
}
