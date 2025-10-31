import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// ✅ CRITICAL FIX: Use correct worker URL
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

import { useLocation, useNavigate } from 'react-router-dom';
import Stepper from '../components/Stepper';
import type { FieldPlacement } from '../context/DocumentContext';
import { useDocument } from '../context/DocumentContext';
import {
  MousePointer2,
  Type,
  Calendar,
  PenTool,
  
  Save,
  Send,
  ZoomIn,
  ZoomOut,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import SignatureModal from '../components/SignatureModal';
import { useAuth } from '../context/AuthContext';
import TextFieldModal from '../components/TextFieldModal';
import DateFieldModal from '../components/DateFieldModal';


export default function Prepare() {
  const { uploadedDoc, docType, fields, setFields, fieldValues, setFieldValues } = useDocument();
  const location = useLocation();
  const navigate = useNavigate();
  const fileName = location.state?.fileName || 'Document.pdf';
  const [zoom, setZoom] = useState(1.0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureModalPos, setSignatureModalPos] = useState<{ x: number; y: number } | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [activeField, setActiveField] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(1);
  const documentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  
  const tools = [
    { id: 'signature', name: 'Signature', icon: PenTool, color: 'blue' },
    { id: 'date', name: 'Date', icon: Calendar, color: 'orange' },
    { id: 'text', name: 'Text', icon: Type, color: 'purple' }
  ];

  const { user } = useAuth();
  // Show all tools to all users; admins can place signatures too.
  const visibleTools = tools;
  const { recipients } = useDocument();
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState<string | null>(null);

  // Place field at bottom of current page
  const handlePlaceFieldAtBottom = () => {
    if (!selectedTool) return;
    const newField = {
      id: `field_${Date.now()}`,
      type: selectedTool as 'signature' | 'date' | 'text' | 'initial' | 'checkbox',
      x: 50, // center horizontally
      y: 95, // near bottom (95%)
      completed: false,
      recipient: selectedRecipientEmail || 'Signer',
      page: currentPage
    };
    setFields([...fields, newField]);
    setActiveField(newField);
    setSelectedTool(null);
  };

  // Move field to bottom of its page
  const handleMoveFieldToBottom = (fieldId: string) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, y: 95 } : f));
  };

  
  
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool) {
      console.log('No tool selected, ignoring click');
      return;
    }

    // Use the actual rendered PDF page element's bounding box so coordinates map to
    // the visible page (accounts for centering, zoom and scroll inside the viewer).
    const pageEl = pageRef.current;
    const rect = pageEl ? pageEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log('Document clicked at:', { x, y, selectedTool });

    const newField = {
      id: `field_${Date.now()}`,
      type: selectedTool as 'signature' | 'initial' | 'date' | 'text' | 'checkbox',
      x: x,
      y: y,
      completed: false,
      recipient: selectedRecipientEmail || 'Signer',
      page: currentPage
    };

    console.log('Creating new field:', newField);

    // If admin is placing a signature, create the visible empty signature field (do NOT auto-fill).
    if (user?.role === 'admin' && newField.type === 'signature') {
      const placedField = { ...newField, completed: false };
      setFields([...fields, placedField]);
      // do not set fieldValues so it remains empty; allow admin to move the box if needed
      setSelectedTool(null);
      return;
    }

    setFields([...fields, newField]);
    setActiveField(newField);
    // Do NOT open modal here; modal will open only when field box is clicked
    setSelectedTool(null);
  };

  // Simple drag state for fields
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Only open modal for signature if not dragging, and only on double click
  const handleFieldClick = (field: any, e: React.MouseEvent) => {
    if (draggingFieldId) return;
    if (field.type !== 'signature') {
      e.preventDefault();
      e.stopPropagation();
      setActiveField(field);
      setSignatureModalPos({ x: e.clientX, y: e.clientY + window.scrollY });
      setTimeout(() => {
        if (field.type === 'date') {
          setShowDateModal(true);
        } else if (field.type === 'text') {
          setShowTextModal(true);
        }
      }, 0);
    } else {
      // For signature: admins should not auto-fill or see a popup — just select the box.
      if (field.type === 'signature' && user?.role === 'admin') {
        try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
        // Do not set any field value; keep it uncompleted so signers can sign later.
        setActiveField(null);
        return;
      }

      // For non-admins, only open modal on double click
      if (e.detail === 2) {
        e.preventDefault();
        e.stopPropagation();
        setActiveField(field);
        setSignatureModalPos({ x: e.clientX, y: e.clientY + window.scrollY });
        setTimeout(() => setShowSignatureModal(true), 0);
      }
    }
  };

  // Drag handlers for field boxes
  // Simple drag for signature fields
  const handleFieldMouseDown = (field: any, e: React.MouseEvent) => {
    if (field.type !== 'signature') return;
    e.stopPropagation();
    setDraggingFieldId(field.id);
    const pageEl = pageRef.current;
    let startX = 0, startY = 0;
    if (pageEl) {
      const rect = pageEl.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      dragOffset.current = {
        x: startX - (rect.width * field.x) / 100,
        y: startY - (rect.height * field.y) / 100
      };
    } else {
      dragOffset.current = { x: 0, y: 0 };
    }
    window.addEventListener('mousemove', handleFieldMouseMove as any);
    window.addEventListener('mouseup', handleFieldMouseUp as any);
  };

  const handleFieldMouseMove = (e: MouseEvent) => {
    if (!draggingFieldId) return;
    const pageEl = pageRef.current;
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
  let relX = e.clientX - rect.left - dragOffset.current.x;
  let relY = e.clientY - rect.top - dragOffset.current.y;
  // Clamp to bounds (allow anywhere in container, including bottom edge)
  relX = Math.max(0, Math.min(rect.width, relX));
  // Allow y to reach 100% (bottom edge)
  relY = Math.max(0, Math.min(rect.height, relY));
  let x = (relX / rect.width) * 100;
  let y = (relY / rect.height) * 100;
  // Clamp y to max 100, but allow field to be visible at bottom
  y = Math.max(0, Math.min(100, y));
  setFields(fields.map((f: FieldPlacement) => f.id === draggingFieldId ? { ...f, x, y } : f));
  };

  const handleFieldMouseUp = () => {
    setDraggingFieldId(null);
    window.removeEventListener('mousemove', handleFieldMouseMove as any);
    window.removeEventListener('mouseup', handleFieldMouseUp as any);
  };

  const handleSaveSignature = (signature: string, type: string, font?: string) => {
    console.log('Saving signature:', { signature, type, font, activeField });
    
    if (activeField) {
      setFieldValues({
        ...fieldValues,
        [activeField.id]: signature,
        [activeField.id + '_type']: type,
        [activeField.id + '_font']: font
      });
      setFields(fields.map((f: any) => 
        f.id === activeField.id ? { ...f, completed: true } : f
      ));
      setActiveField(null);
    }
    setShowSignatureModal(false);
  };

  const handleSaveText = (text: string) => {
    console.log('Saving text:', { text, activeField });
    
    if (activeField) {
      setFieldValues({ 
        ...fieldValues, 
        [activeField.id]: text 
      });
      setFields(fields.map((f: any) => 
        f.id === activeField.id ? { ...f, completed: true } : f
      ));
    }
    setShowTextModal(false);
    setActiveField(null);
  };

  const handleSaveDate = (date: string) => {
    console.log('Saving date:', { date, activeField });
    
    if (activeField) {
      setFieldValues({ 
        ...fieldValues, 
        [activeField.id]: date 
      });
      setFields(fields.map((f: any) => 
        f.id === activeField.id ? { ...f, completed: true } : f
      ));
    }
    setShowDateModal(false);
    setActiveField(null);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    const newFieldValues = { ...fieldValues };
    delete newFieldValues[fieldId];
    delete newFieldValues[fieldId + '_type'];
    delete newFieldValues[fieldId + '_font'];
    setFieldValues(newFieldValues);
  };

  const handleSendForSignature = () => {
    // Allow proceeding to Send even when there are no fields/signatures.
    // Signatures are optional. Navigate directly to the Send page.
    navigate('/send');
  };

  const getFieldPosition = (field: any) => {
    return {
      left: `${field.x}%`,
      top: `${field.y}%`,
      position: 'absolute' as const
    };
  };

  return (
    <>
      {user?.role !== 'admin' && (
        <SignatureModal
          isOpen={showSignatureModal}
          initialPosition={signatureModalPos}
          onClose={() => {
            console.log('Closing signature modal');
            setShowSignatureModal(false);
            setActiveField(null);
            setSignatureModalPos(null);
          }}
          onSave={handleSaveSignature}
        />
      )}
      <TextFieldModal
        isOpen={showTextModal}
        onClose={() => {
          setShowTextModal(false);
          setActiveField(null);
        }}
        onSave={handleSaveText}
        fieldLabel="Text"
        placeholder="Text related to the document"
      />
      <DateFieldModal
        isOpen={showDateModal}
        onClose={() => {
          setShowDateModal(false);
          setActiveField(null);
        }}
        onSave={handleSaveDate}
      />
      {/* Admin field popup shown after admin places or clicks a signature field */}
      
      
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Stepper steps={["Upload", "Prepare", "Send"]} currentStep={2} />
          </div>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{fileName}</h1>
              <p className="text-sm text-gray-600">Add fields and prepare for signature</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Save Draft</span>
              </button>
              <button
                onClick={handleSendForSignature}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Send for Signature</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Fields</h2>
              <div className="space-y-2 mb-8">
                {visibleTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        console.log('Tool selected:', tool.id);
                        setSelectedTool(tool.id);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        selectedTool === tool.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className={`bg-${tool.color}-100 p-2 rounded`}>
                        <Icon className={`h-5 w-5 text-${tool.color}-600`} />
                      </div>
                      <span className="font-medium text-gray-900">{tool.name}</span>
                    </button>
                  );
                })}
                {/* Place at Bottom button */}
                {selectedTool && (
                  <button
                    onClick={handlePlaceFieldAtBottom}
                    className="w-full mt-2 flex items-center justify-center p-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    Place at Bottom of Page
                  </button>
                )}

                {/* Recipient selector for admins when placing signature fields */}
                {user?.role === 'admin' && selectedTool === 'signature' && (
                  <div className="mt-4 p-3 border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to recipient</label>
                    <div className="space-y-2">
                      {(recipients || []).map(r => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRecipientEmail(r.email)}
                          className={`w-full text-left px-3 py-2 rounded-md border ${selectedRecipientEmail === r.email ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{r.name || r.email}</div>
                              <div className="text-xs text-gray-500">{r.email} • {r.designation || '—'}</div>
                            </div>
                            {selectedRecipientEmail === r.email && <div className="text-xs text-blue-600">Selected</div>}
                          </div>
                        </button>
                      ))}
                      {(!recipients || recipients.length === 0) && (
                        <div className="text-sm text-gray-500">No recipients defined. Add recipients in Upload first.</div>
                      )}
                      {selectedRecipientEmail && (
                        <div className="mt-2 text-sm text-gray-600">Selected recipient: <span className="font-medium">{selectedRecipientEmail}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                {fields.length > 0 ? (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${field.completed ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                          <span className="capitalize">{field.type} {index + 1}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No fields added yet</p>
                )}
              </div>

              
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm mb-6 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ZoomOut className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ZoomIn className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Page {currentPage} of {numPages}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {selectedTool ? (
                      <span className="text-blue-600 font-medium">
                        <MousePointer2 className="h-4 w-4 inline mr-1" />
                        Click on document to place {selectedTool} field
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Select a field type to place on document
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-xl rounded-lg relative document-container">
                {uploadedDoc && docType === 'pdf' ? (
                  <>
                    <div ref={documentRef} className="relative w-full pdf-viewer-container overflow-y-auto" style={{ height: '800px' }}>
                      <Document
                        file={uploadedDoc}
                        onLoadSuccess={({ numPages }) => {
                          console.log('PDF loaded, pages:', numPages);
                          setNumPages(numPages);
                        }}
                        loading={<div className="p-8 text-center">Loading PDF...</div>}
                      >
                        {/* pageRef wraps the rendered Page so we can align overlays and compute coordinates precisely */}
                        <div ref={pageRef} onClick={handleDocumentClick} style={{ display: 'inline-block', position: 'relative', cursor: selectedTool ? 'crosshair' : 'default' }}>
                          <Page
                            pageNumber={currentPage}
                            width={800 * zoom}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                          />

                          {/* overlay tied to pageRef so positions use the page bounding box */}
                          <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                            {fields.filter(field => field.page === currentPage).map((field) => (
                              <div
                                key={field.id}
                                style={{
                                  ...getFieldPosition(field),
                                  zIndex: 30,
                                  pointerEvents: 'auto',
                                  cursor: 'pointer',
                                  transition: draggingFieldId === field.id ? 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' : undefined
                                }}
                                onClick={(e) => handleFieldClick(field, e)}
                                onMouseDown={(e) => handleFieldMouseDown(field, e)}
                                className={`px-3 py-2 rounded border bg-white shadow-lg group hover:shadow-xl transition-all duration-200 field-container ${
                                  field.completed
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-blue-500 border-2 bg-blue-50'
                                } ${field.type === 'signature' && draggingFieldId === field.id ? 'ring-2 ring-blue-400 cursor-grabbing scale-105' : 'cursor-move'}`}
                              >
                                <div className="flex items-center space-x-2 min-w-[120px]">
                                  {field.type === 'signature' && (
                                    fieldValues[field.id] ? (
                                      fieldValues[field.id + '_type'] === 'draw' || fieldValues[field.id + '_type'] === 'upload' ? (
                                        <img src={fieldValues[field.id]} alt="Signature" className="h-6 max-w-[80px] object-contain" />
                                      ) : (
                                        <span className="text-lg whitespace-nowrap" style={{ fontFamily: fieldValues[field.id + '_font'] || 'Dancing Script' }}>
                                          {fieldValues[field.id]}
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-sm font-medium text-blue-600 whitespace-nowrap">✍️ {field.type}</span>
                                    )
                                  )}
                                  {field.type === 'date' && (
                                    fieldValues[field.id] ? (
                                      <span className="text-sm">{fieldValues[field.id]}</span>
                                    ) : (
                                      <span className="text-sm font-medium text-blue-600">📅 {field.type}</span>
                                    )
                                  )}
                                  {field.type === 'text' && (
                                    fieldValues[field.id] ? (
                                      <span className="text-sm">{fieldValues[field.id]}</span>
                                    ) : (
                                      <span className="text-sm font-medium text-blue-600">📝 {field.type}</span>
                                    )
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveField(field.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  {/* Move to Bottom button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveFieldToBottom(field.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 ml-2 transition-opacity"
                                    title="Move to Bottom"
                                  >
                                    ↓
                                  </button>
                                </div>
                                {/* Recipient identity is intentionally hidden in the box (no name or email shown) */}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Document>
                    </div>
                    
                    <div className="flex items-center justify-center mt-4 pb-4 space-x-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {numPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                        disabled={currentPage === numPages}
                        className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center min-h-[800px] flex items-center justify-center">
                    <div>
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Document preview area</p>
                      <p className="text-sm text-gray-400 mt-2">Upload a document to start adding fields</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2z 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
