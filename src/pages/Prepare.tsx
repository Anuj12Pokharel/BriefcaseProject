import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// ✅ CRITICAL FIX: Use correct worker URL
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

import { useLocation, useNavigate } from 'react-router-dom';
import { useDocument } from '../context/DocumentContext';
import {
  MousePointer2,
  Type,
  Calendar,
  PenTool,
  User,
  Mail,
  Save,
  Send,
  ZoomIn,
  ZoomOut,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AddRecipientModal from '../components/AddRecipientModal';
import SignatureModal from '../components/SignatureModal';
import TextFieldModal from '../components/TextFieldModal';
import DateFieldModal from '../components/DateFieldModal';

export default function Prepare() {
  const { uploadedDoc, docType, fields, setFields, fieldValues, setFieldValues } = useDocument();
  const location = useLocation();
  const navigate = useNavigate();
  const fileName = location.state?.fileName || 'Document.pdf';
  const [zoom, setZoom] = useState(1.0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureModalPos, setSignatureModalPos] = useState<{ x: number; y: number } | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [activeField, setActiveField] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(1);
  const documentRef = useRef<HTMLDivElement>(null);
  const [recipients, setRecipients] = useState([
    { name: 'John Smith', email: 'john@example.com', role: 'Signer' },
    { name: 'Jane Doe', email: 'jane@example.com', role: 'Approver' }
  ]);

  const tools = [
    { id: 'signature', name: 'Signature', icon: PenTool, color: 'blue' },
    { id: 'date', name: 'Date', icon: Calendar, color: 'orange' },
    { id: 'text', name: 'Text', icon: Type, color: 'purple' }
  ];

  // Place field at bottom of current page
  const handlePlaceFieldAtBottom = () => {
    if (!selectedTool) return;
    const newField = {
      id: `field_${Date.now()}`,
      type: selectedTool as 'signature' | 'date' | 'text' | 'initial' | 'checkbox',
      x: 50, // center horizontally
      y: 95, // near bottom (95%)
      completed: false,
      recipient: recipients[0]?.name || 'John Smith',
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

  const handleAddRecipient = (recipient: { name: string; email: string; role: string }) => {
    setRecipients([...recipients, recipient]);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool) {
      console.log('No tool selected, ignoring click');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log('Document clicked at:', { x, y, selectedTool });

    const newField = {
      id: `field_${Date.now()}`,
      type: selectedTool as 'signature' | 'initial' | 'date' | 'text' | 'checkbox',
      x: x,
      y: y,
      completed: false,
      recipient: recipients[0]?.name || 'John Smith',
      page: currentPage
    };

    console.log('Creating new field:', newField);

    setFields([...fields, newField]);
    setActiveField(newField);
    // Do NOT open modal here; modal will open only when field box is clicked
    setSelectedTool(null);
  };

  // Drag state for fields
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number; field: any } | null>(null);
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
      // For signature, only open modal on double click
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
  // Only signature fields get desktop-style drag
  const handleFieldMouseDown = (field: any, e: React.MouseEvent) => {
    if (field.type !== 'signature') return;
    e.stopPropagation();
    setDraggingFieldId(field.id);
    const parent = documentRef.current;
    let startX = 0, startY = 0;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top + parent.scrollTop;
      dragOffset.current = {
        x: startX - (rect.width * field.x) / 100,
        y: startY - (rect.height * field.y) / 100
      };
    } else {
      dragOffset.current = { x: 0, y: 0 };
    }
    setDragGhost({ x: startX, y: startY, field });
    window.addEventListener('mousemove', handleFieldMouseMove as any);
    window.addEventListener('mouseup', handleFieldMouseUp as any);
  };

  const handleFieldMouseMove = (e: MouseEvent) => {
    if (!draggingFieldId || !dragGhost) return;
    const parent = documentRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    let relX = e.clientX - rect.left - dragOffset.current.x;
    let relY = e.clientY - rect.top - dragOffset.current.y + parent.scrollTop;
    // Clamp to bounds
    relX = Math.max(0, Math.min(rect.width, relX));
    relY = Math.max(0, Math.min(rect.height, relY));
    setDragGhost({ x: relX, y: relY, field: dragGhost.field });
  };

  const handleFieldMouseUp = () => {
    if (!draggingFieldId || !dragGhost) {
      setDraggingFieldId(null);
      setDragGhost(null);
      window.removeEventListener('mousemove', handleFieldMouseMove as any);
      window.removeEventListener('mouseup', handleFieldMouseUp as any);
      return;
    }
    const parent = documentRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const x = (dragGhost.x / rect.width) * 100;
    const y = (dragGhost.y / rect.height) * 100;
    setFields(fields => fields.map(f => f.id === draggingFieldId ? { ...f, x, y } : f));
    setDraggingFieldId(null);
    setTimeout(() => setDragGhost(null), 200); // allow drop animation
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
    if (fields.length === 0) {
      alert('Please add at least one field to the document before sending for signature.');
      return;
    }
    navigate('/sign');
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
      <AddRecipientModal
        isOpen={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
        onAdd={handleAddRecipient}
      />
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
      
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
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
                {tools.map((tool) => {
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

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Recipients ({recipients.length})
                </h3>
                <div className="space-y-3">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-100 p-1.5 rounded">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{recipient.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveRecipient(index)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          title="Remove recipient"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                        <Mail className="h-3 w-3" />
                        <span>{recipient.email}</span>
                      </div>
                      <div>
                        <span className="inline-block px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                          {recipient.role}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowRecipientModal(true)}
                    className="w-full py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors text-sm"
                  >
                    + Add Recipient
                  </button>
                </div>
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
                    <div 
                      ref={documentRef} 
                      className="relative w-full pdf-viewer-container overflow-y-auto" 
                      style={{ 
                        cursor: selectedTool ? 'crosshair' : 'default', 
                        height: '800px' 
                      }}
                      onClick={handleDocumentClick}
                    >
                      <Document
                        file={uploadedDoc}
                        onLoadSuccess={({ numPages }) => {
                          console.log('PDF loaded, pages:', numPages);
                          setNumPages(numPages);
                        }}
                        loading={<div className="p-8 text-center">Loading PDF...</div>}
                      >
                        <Page
                          pageNumber={currentPage}
                          width={800 * zoom}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      </Document>
                      
                      <div 
                        className="absolute top-0 left-0 w-full h-full" 
                        style={{ pointerEvents: 'none' }}
                      >
                        {/* Ghost preview for signature field drag */}
                        {dragGhost && dragGhost.field.type === 'signature' && draggingFieldId && (
                          <div
                            className="pointer-events-none absolute z-50 opacity-80 scale-110 transition-transform duration-200 animate-pulse"
                            style={{
                              left: dragGhost.x,
                              top: dragGhost.y,
                              minWidth: 120,
                              width: 'auto',
                            }}
                          >
                            <div className="px-3 py-2 rounded border-2 border-dashed border-blue-400 bg-white shadow-lg">
                              <div className="flex items-center space-x-2 min-w-[120px]">
                                <span className="text-sm font-medium text-blue-600 whitespace-nowrap">✍️ Signature</span>
                              </div>
                            </div>
                          </div>
                        )}
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
                            <div className="text-xs text-gray-500 mt-1 text-center">{field.recipient}</div>
                          </div>
                        ))}
                      </div>
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}