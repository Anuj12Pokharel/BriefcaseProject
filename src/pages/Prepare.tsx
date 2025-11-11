import { useState, useRef, useEffect } from 'react';
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
  // Show signature tool only to admins (clients should not be able to add/signature fields via the tool).
  const visibleTools = tools.filter(t => {
    if (t.id === 'signature' && user?.role !== 'admin') return false;
    return true;
  });
  const { recipients } = useDocument();
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState<string | null>(null);

  // Default selected recipient:
  // - non-admins: their email so they see their fields.
  // - admins: default to the first recipient (if any) so it's selected by default.
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      setSelectedRecipientEmail(user.email || null);
    } else {
      if (recipients && recipients.length > 0) {
        setSelectedRecipientEmail(recipients[0].email);
      } else {
        setSelectedRecipientEmail(null);
      }
    }
  }, [user, recipients]);

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
    // Admins placing a signature should not open the signing modal.
    if (user?.role === 'admin' && newField.type === 'signature') {
      setFields([...fields, { ...newField, completed: false }]);
      setSelectedTool(null);
      return;
    }

    setFields([...fields, newField]);
    setActiveField(newField);

    // If the field is a signature and it's assigned to the current logged-in user,
    // open the signature modal so they can sign immediately.
    if (newField.type === 'signature' && user?.email && newField.recipient === user.email) {
      setSignatureModalPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setTimeout(() => setShowSignatureModal(true), 0);
    }

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

    // If the signer is placing a signature for themselves, open the modal immediately
    // so they can adopt/sign right after placing the field.
    setFields([...fields, newField]);
    setActiveField(newField);
    if (newField.type === 'signature' && user?.email && newField.recipient === user.email) {
      setSignatureModalPos({ x: e.clientX, y: e.clientY + window.scrollY });
      setTimeout(() => setShowSignatureModal(true), 0);
    }

    // For other cases (placing signatures for others or non-signature fields), do not open modal.
    setSelectedTool(null);
  };

  // Simple drag state for fields
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const draggingFieldIdRef = useRef<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragPreviewRef = useRef<HTMLElement | null>(null);
  const dragInitialRectRef = useRef<{ left: number; top: number }>({ left: 0, top: 0 });

  // Only open modal for signature if not dragging.
  // Admins should not open the signature modal here (they only place/assign fields).
  // Non-admin users may open the modal only for fields assigned to them.
  const handleFieldClick = (field: any, e: React.MouseEvent) => {
    // Prevent click if we were dragging
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }

    // Non-signature fields: open respective modals (text/date) on click
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
      return;
    }

    // For signature fields: open the signature modal for any user (admin or recipient)
    e.preventDefault();
    e.stopPropagation();
    setActiveField(field);
    setSignatureModalPos({ x: e.clientX, y: e.clientY + window.scrollY });
    setTimeout(() => setShowSignatureModal(true), 0);
  };

  // Drag handlers for field boxes (use pointer events)
  const handleFieldPointerDown = (e: React.PointerEvent, field: FieldPlacement) => {
    // Allow admins to drag signature and date fields in Prepare mode
    if (user?.role !== 'admin') return;
    if (field.type !== 'signature' && field.type !== 'date') return;

    e.stopPropagation();
    e.preventDefault();

  draggingFieldIdRef.current = field.id;
  setDraggingFieldId(field.id);
    isDraggingRef.current = false; // Will be set to true if pointer actually moves

    const clientX = e.clientX;
    const clientY = e.clientY;

    // Store initial pointer position to detect actual drag movement
    dragStartPosRef.current = { x: clientX, y: clientY };

    // Capture pointer offset inside the field so the field follows smoothly without jumping
    const fieldElement = e.currentTarget as HTMLElement;
    const fieldRect = fieldElement.getBoundingClientRect();
    dragOffset.current = {
      x: clientX - fieldRect.left,
      y: clientY - fieldRect.top
    };
    // Setup preview element for immediate visual feedback
    dragPreviewRef.current = fieldElement;
    dragInitialRectRef.current = { left: fieldRect.left, top: fieldRect.top };

    // Attempt to capture the pointer on the element so we reliably get pointermove/up
    try { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); } catch (err) {}

    console.log('Start dragging field', field.id, field.type, 'offset', dragOffset.current);

    // Attach global pointer listeners so dragging continues even if pointer leaves the element
    window.addEventListener('pointermove', handlePointerMove as any);
    window.addEventListener('pointerup', handlePointerUp as any);
  };

  const handlePointerMove = (ev: PointerEvent) => {
    if (!draggingFieldIdRef.current) return;

    // Detect if pointer actually moved (more than 3px) to distinguish drag from click
    const moved = Math.abs(ev.clientX - dragStartPosRef.current.x) > 3 ||
                  Math.abs(ev.clientY - dragStartPosRef.current.y) > 3;
    if (moved) isDraggingRef.current = true;

    const pageEl = pageRef.current;
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    let relX = ev.clientX - rect.left - dragOffset.current.x;
    let relY = ev.clientY - rect.top - dragOffset.current.y;
    // Clamp to bounds
    relX = Math.max(0, Math.min(rect.width, relX));
    relY = Math.max(0, Math.min(rect.height, relY));
    let x = (relX / rect.width) * 100;
    let y = (relY / rect.height) * 100;
    y = Math.max(0, Math.min(100, y));

    // Update preview transform for immediate feedback
    try {
      if (dragPreviewRef.current) {
        const dx = ev.clientX - dragStartPosRef.current.x;
        const dy = ev.clientY - dragStartPosRef.current.y;
        dragPreviewRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        dragPreviewRef.current.style.transition = 'transform 0s';
      }
    } catch (err) {}

    // Log to trace live coordinates
    // console.log('drag move ->', draggingFieldIdRef.current, x.toFixed(2), y.toFixed(2));
    const activeId = draggingFieldIdRef.current;
    setFields((prev: FieldPlacement[]) => prev.map((f: FieldPlacement) => f.id === activeId ? { ...f, x, y } : f));
  };

  const handlePointerUp = (ev?: PointerEvent) => {
    // End drag; avoid reading the possibly-stale `fields` variable here
    console.log('End dragging. draggingFieldId:', draggingFieldIdRef.current);
    draggingFieldIdRef.current = null;
    setDraggingFieldId(null);
    try {
      // release pointer capture if previously captured
      (dragPreviewRef.current as any)?.releasePointerCapture?.(ev?.pointerId);
    } catch (err) {}
    window.removeEventListener('pointermove', handlePointerMove as any);
    window.removeEventListener('pointerup', handlePointerUp as any);
    // clear any preview transform
    try { if (dragPreviewRef.current) { dragPreviewRef.current.style.transform = ''; dragPreviewRef.current.style.transition = ''; } } catch (err) {}
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
              {/* NOTE: The compact top recipient selector was removed per UX request.
                  A persistent recipient list is rendered at the bottom of the sidebar.
              */}
              {/* Persistent recipients panel placed above the tools so it's easy
                  to pick a recipient before selecting a field or the signature tool.
              */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Recipients</h3>
                <div className="max-h-44 overflow-y-auto space-y-2 pr-2 mb-2">
                  {(recipients || []).map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRecipientEmail(r.email)}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between border ${selectedRecipientEmail === r.email ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{r.name || r.email}</div>
                        <div className="text-xs text-gray-500">{r.email} • {r.designation || '—'}</div>
                      </div>
                      {selectedRecipientEmail === r.email && <div className="text-xs text-blue-600">Selected</div>}
                    </button>
                  ))}
                  {(!recipients || recipients.length === 0) && (
                    <div className="text-sm text-gray-500">No recipients defined. Add recipients in Upload first.</div>
                  )}
                </div>
              </div>

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

                {/* The inline admin-only assign block was removed to avoid duplication.
                    Use the persistent recipient list above instead.
                */}
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                {fields.length > 0 ? (
                  <div className="space-y-2">
                    {/* Hide signature-type entries from the sidebar for admin users (per UX request).
                        This removes the blue-dot "Signature 1 / 2 / ..." rows shown in the screenshot.
                        Non-admin users still see the full list so they can manage their own fields. */}
                    {fields
                      .filter((f) => !(user?.role === 'admin' && f.type === 'signature'))
                      .map((field, index) => (
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

              {/* Bottom duplicate recipients panel removed per user request; only the top recipients list remains. */}
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
                            {fields
                              .filter(field => field.page === currentPage)
                              .filter(field => {
                                // Admins should see all fields. Non-admins only see fields assigned to them
                                if (user?.role === 'admin') return true;
                                // If no recipient assigned, show (generic fields)
                                if (!field.recipient) return true;
                                // Only show field if it is assigned to current user
                                return user?.email && field.recipient === user.email;
                              })
                              .map((field) => (
                              <div
                                key={field.id}
                                style={{
                                  ...getFieldPosition(field),
                                  zIndex: 30,
                                  pointerEvents: 'auto',
                                  cursor: (user?.role === 'admin' && (field.type === 'signature' || field.type === 'date')) ? (draggingFieldId === field.id ? 'grabbing' : 'grab') : 'pointer',
                                  transition: draggingFieldId === field.id ? 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' : undefined,
                                  // Larger padding for easier grabbing
                                  padding: '16px'
                                }}
                                onClick={(e) => handleFieldClick(field, e)}
                                onPointerDown={(e) => handleFieldPointerDown(e, field)}
                                className={`rounded border bg-white shadow-lg group hover:shadow-xl transition-all duration-200 field-container ${
                                  field.completed
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-blue-500 border-2 bg-blue-50'
                                } ${
                                  draggingFieldId === field.id ? 'ring-4 ring-blue-500 scale-110 shadow-2xl' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-2 min-w-[120px]">
                                  {field.type === 'signature' && (
                                    // Admin-style signature field: label at left, long dashed underline, small blue 'Sign here' badge above the line
                                    <div className="relative w-72">
                                      <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
                                        <div className="bg-blue-800 text-white text-sm px-3 py-1 rounded">Sign here</div>
                                      </div>

                                      <div className="flex items-center">
                                        <div className="text-sm text-gray-700 font-medium mr-3">Signature:</div>
                                        <div className="flex-1 border-b border-dashed border-gray-400" style={{ minWidth: '220px' }} />
                                      </div>

                                      {/* preview (if value exists) shown below the line for admin */}
                                      {fieldValues[field.id] && (
                                        <div className="mt-8 flex items-center justify-center">
                                          {fieldValues[field.id + '_type'] === 'draw' || fieldValues[field.id + '_type'] === 'upload' ? (
                                            <img src={fieldValues[field.id]} alt="Signature" className="max-h-8 max-w-full object-contain" />
                                          ) : (
                                            <span className="text-lg whitespace-nowrap" style={{ fontFamily: fieldValues[field.id + '_font'] || 'Dancing Script' }}>
                                              {fieldValues[field.id]}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {field.type === 'date' && (
                                    fieldValues[field.id] ? (
                                      // Date field with label and dashed line, date value above the line
                                      <div className="relative w-72">
                                        <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
                                          <div className="text-sm text-gray-800 font-medium">{fieldValues[field.id]}</div>
                                        </div>

                                        <div className="flex items-center">
                                          <div className="text-sm text-gray-700 font-medium mr-3">Date:</div>
                                          <div className="flex-1 border-b border-dashed border-gray-400" style={{ minWidth: '220px' }} />
                                        </div>
                                      </div>
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
                                    onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveField(field.id);
                                    }}
                                    className="absolute top-1 right-1 z-50 flex items-center justify-center w-6 h-6 bg-white border border-gray-300 rounded-full shadow-sm text-gray-600 hover:text-red-600 hover:border-red-400"
                                    title="Remove field"
                                  >
                                    <X className="h-3.5 w-3.5" />
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
                                {/* Show assigned recipient in small text at bottom-right of the field box */}
                                {field.recipient && (
                                  <div className="absolute right-2 bottom-1 text-[11px] text-gray-600 italic pointer-events-none">{
                                    (recipients || []).find((rr: any) => rr.email === field.recipient)?.name || field.recipient
                                  }</div>
                                )}
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
