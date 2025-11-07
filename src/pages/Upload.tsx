import React, { useEffect, useRef, useState } from 'react';
import { Upload as UploadIcon, FileText, X, ArrowRight, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocument } from '../context/DocumentContext';
import Stepper from '../components/Stepper';

function Upload() {
  const navigate = useNavigate();
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  // Templates state
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates] = useState<Array<{id:string; title:string; body:string; updatedAt?: number}>>(() => {
    try {
      const raw = localStorage.getItem('messageTemplates');
      const base = raw ? JSON.parse(raw) : [
        { id: 'tpl1', title: 'Welcome', body: 'Hello,\n\nPlease review and sign the attached document.\n\nThanks,' },
        { id: 'tpl2', title: 'Reminder', body: 'Reminder: Please sign the document by EOD.\n\nThanks!' }
      ];
      // Normalize to include updatedAt
      return base.map((t: any) => ({ ...t, updatedAt: t.updatedAt || Date.now() }));
    } catch (e) {
      return [];
    }
  });
  const [previewTemplate, setPreviewTemplate] = useState<null | {id:string;title:string;body:string}>(null);
  const [error, setError] = useState<string | null>(null);

  const { setDocument, setFieldValues, uploadedDoc, fieldValues, recipients, setRecipients } = useDocument();
  const { user } = useAuth();

  // Configuration
  const MAX_FILE_SIZE_MB = 25; // adjust if needed

  // Create/revoke preview URL whenever uploadedFile changes
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
      // set default title if not edited yet
      setTitle(prev => (prev ? prev : uploadedFile.name.replace(/\.pdf$/i, '')));
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    } else {
      setPreviewUrl(null);
      setTitle('');
      setError(null);
    }
  }, [uploadedFile]);

  // restore uploaded file from DocumentContext if component remounts
  useEffect(() => {
    if (!uploadedFile && uploadedDoc) {
      if (typeof uploadedDoc === 'string') {
        // remote URL
        setPreviewUrl(uploadedDoc);
      } else {
        setUploadedFile(uploadedDoc as File);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedDoc]);

  // Initialize local message from context when the component mounts (or when navigated to).
  // We avoid listening to every context change here to prevent a two-way sync that can
  // cause a render loop. Template insert/navigation will remount Upload so this is sufficient.
  useEffect(() => {
    try {
      const ctxMessage = (fieldValues && fieldValues.messageToRecipients) || '';
      if (ctxMessage !== message) setMessage(ctxMessage);
    } catch (e) {
      // ignore
    }
    // Intentionally run once on mount to pick up any inserted template from other pages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NOTE: avoid writing context from a useEffect that listens to context -> message -> context because
  // that can create a render loop. Instead we update context directly when the user types (see textarea onChange).

  const validateFile = (file: File) => {
    setError(null);
    const isPdfMime = file.type === 'application/pdf';
    const nameLooksLikePdf = /\.pdf$/i.test(file.name);
    const sizeOk = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!(isPdfMime || nameLooksLikePdf)) {
      return 'Unsupported file type. Please upload a PDF.';
    }
    if (!sizeOk) {
      return `File is too large. Max ${MAX_FILE_SIZE_MB} MB allowed.`;
    }
    return null;
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setUploadedFile(null);
      setError(validationError);
      return;
    }
    setUploadedFile(file);
    // persist in context so preview survives navigation
    try {
      setDocument(file, 'pdf');
    } catch (e) {
      // ignore
    }
    setError(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    // reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Template helpers
  // Template helpers: (delete/edit are managed elsewhere; modal provides preview + insert only)

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    if (!uploadedFile) return;
    // Require recipients for admins before proceeding to Prepare
    try {
      if (user?.role === 'admin') {
        const validRecipients = (recipients || []).filter(r => r.name && r.name.trim() && r.email && r.email.trim() && isValidEmail(r.email));
        if (validRecipients.length === 0) {
          setError('Please add at least one recipient with a valid name and email before continuing.');
          return;
        }
      }

      // Store the real File object in context and also store a preview URL if needed
      setDocument(uploadedFile, 'pdf'); // pass the File; change if your context expects something else
      setFieldValues((prev: Record<string, any>) => ({
        ...prev,
        documentTitle: title,
        messageToRecipients: message || '',
      }));
      navigate('/prepare', { state: { fileName: uploadedFile.name } });
    } catch (err) {
      console.error('Error saving document to context', err);
      setError('Failed to save document. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* flow stepper */}
        <Stepper steps={["Upload", "Prepare", "Send"]} currentStep={1} />
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Document</h1>
          <p className="text-lg text-gray-600">Upload a document to prepare it for signature</p>
        </div>

        {!uploadedFile ? (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            aria-label="File drop zone"
          >
            <div className="flex flex-col items-center">
              <div className={`${isDragging ? 'bg-blue-100' : 'bg-gray-100'} p-6 rounded-full mb-6 transition-colors`}>
                <UploadIcon className={`h-16 w-16 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Drag and drop your document here</h3>
              <p className="text-gray-600 mb-6">or</p>

              <div>
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-hidden
                />
              </div>

              <p className="text-sm text-gray-500 mt-6">Supported format: PDF. Max {MAX_FILE_SIZE_MB} MB</p>
              {error && <p className="text-sm text-red-600 mt-2" role="alert">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{uploadedFile.name}</h3>
                  <p className="text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => { setUploadedFile(null); try { setDocument(null, null); } catch (e) {} }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Remove uploaded file"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

              <div className="space-y-4 mb-8">
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Document Details</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="docTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Document Title

              {/* restore from context if component remounted and uploadedFile is empty */}
              {/* (this effect runs only once) */}
              {/**/}
                    </label>
                    <input
                      id="docTitle"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message to Recipients (Optional)
                    </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          rows={3}
                          placeholder="Add a message for the recipients..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none pr-12"
                          value={message}
                          onChange={e => {
                            const v = e.target.value;
                            setMessage(v);
                            try {
                              setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: v }));
                            } catch (err) {
                              // ignore
                            }
                          }}
                        />
                        <button
                          type="button"
                          aria-label="Open templates"
                          title="Templates"
                          onClick={() => setTemplatesOpen(true)}
                          className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900 bg-white rounded-md shadow-sm border"
                        >
                          Templates
                        </button>
                      </div>
                  </div>

                  {/* Recipients (admin only) */}
                  {user?.role === 'admin' && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Recipients <span className="text-sm text-gray-500">({recipients.length})</span></h4>
                        <button
                          onClick={() => {
                            const id = `r_${Date.now()}`;
                            setRecipients([...(recipients || []), { id, name: '', email: '', designation: '' }]);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Recipient
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(recipients || []).map((r, idx) => (
                          <div key={r.id} className="p-3 border border-gray-100 rounded-md bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">Recipient {idx + 1}</div>
                              <button
                                onClick={() => setRecipients(recipients.filter(rr => rr.id !== r.id))}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >Remove</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                placeholder="Full name"
                                value={r.name}
                                onChange={(e) => setRecipients(recipients.map(rr => rr.id === r.id ? { ...rr, name: e.target.value } : rr))}
                                className="px-3 py-2 border rounded-md"
                              />
                              <input
                                type="email"
                                placeholder="Email"
                                value={r.email}
                                onChange={(e) => setRecipients(recipients.map(rr => rr.id === r.id ? { ...rr, email: e.target.value } : rr))}
                                className="px-3 py-2 border rounded-md"
                              />
                              <input
                                type="text"
                                placeholder="Designation"
                                value={r.designation}
                                onChange={(e) => setRecipients(recipients.map(rr => rr.id === r.id ? { ...rr, designation: e.target.value } : rr))}
                                className="px-3 py-2 border rounded-md"
                              />
                            </div>
                          </div>
                        ))}
                        {recipients.length === 0 && (
                          <div className="text-sm text-gray-500">No recipients added yet.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {previewUrl && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Preview</label>
                        <div>
                          <button onClick={() => navigate('/preview', { state: { previewUrl } })} className="text-sm px-3 py-1 bg-white border rounded-md shadow-sm">Full page</button>
                        </div>
                      </div>
                      <div className="w-full h-[768px] border rounded-lg overflow-hidden">
                        <iframe
                          title="PDF preview"
                          src={previewUrl}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-600 mt-2" role="alert">{error}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setUploadedFile(null)}
                className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 ${!uploadedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!uploadedFile}
                aria-disabled={!uploadedFile}
              >
                <span>Continue to Prepare</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <UploadIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Step 1: Upload</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Upload your PDF document to get started
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Step 2: Prepare</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Add signature fields and form elements
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Step 3: Send</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Send to recipients for signature
            </p>
          </div>
        </div>
      </div>
      {/* Templates modal (read-only list + preview/insert) */}
      {templatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setTemplatesOpen(false); setPreviewTemplate(null); }} />
          <div className="relative bg-white rounded-xl w-full max-w-3xl mx-4 p-6 shadow-lg z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Message Templates</h3>
                <div className="flex items-center space-x-3">
                <button onClick={() => { setTemplatesOpen(false); window.open('/manage-templates', '_blank'); }} className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm">
                  <Plus className="h-4 w-4 mr-2" /> Manage templates
                </button>
                <button onClick={() => { setTemplatesOpen(false); setPreviewTemplate(null); }} className="text-sm text-gray-600">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <div className="text-sm text-gray-500">No templates yet. Use Manage templates to add one.</div>
                ) : (
                  templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setPreviewTemplate(t)}
                      className="w-full text-left p-3 rounded-md border border-gray-100 hover:shadow-sm bg-white"
                    >
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-sm text-gray-500 truncate">{t.body}</div>
                    </button>
                  ))
                )}
              </div>

              <div className="md:col-span-2 p-3 border border-gray-100 rounded-md">
                    {previewTemplate ? (
                  <div>
                    <h4 className="font-semibold text-gray-900">Preview: {previewTemplate.title}</h4>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap text-gray-800">{previewTemplate.body}</div>
                    <div className="mt-3">
                      <button onClick={() => {
                        const newMsg = message ? message + '\n\n' + previewTemplate.body : previewTemplate.body;
                        setMessage(newMsg);
                        try { setFieldValues((prev: Record<string, any>) => ({ ...prev, messageToRecipients: newMsg })); } catch (e) {}
                        setTemplatesOpen(false);
                        setPreviewTemplate(null);
                      }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Insert</button>
                      <button onClick={() => setPreviewTemplate(null)} className="ml-2 px-3 py-1.5 bg-gray-100 rounded text-sm">Close</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Select a template to preview or click Insert to add it to your message.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}

export default Upload;
