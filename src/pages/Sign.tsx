import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Check, X, PenTool, ChevronUp, ChevronDown } from "lucide-react";
import SignatureModal from '../components/SignatureModal';
import { useAuth } from '../context/AuthContext';
import InitialModal from '../components/InitialModal';
import TextFieldModal from '../components/TextFieldModal';
import DateFieldModal from '../components/DateFieldModal';
import { useDocument } from '../context/DocumentContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface Signature {
  id: number;
  data: string;
  type: string;
  font?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export default function Sign() {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(1);

  const { uploadedDoc, docType, fields, setFields, fieldValues, setFieldValues, setDocument } = useDocument();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSignerEmail, setCurrentSignerEmail] = useState<string | null>(null);

  // If the page is opened from an external link (email), the sender may include a preview URL
  // or file URL in location.state.previewUrl or as a query param `file`. Mounting logic will
  // set the document into context so the preview loads and the recipient can sign without login.
  useEffect(() => {
    if (uploadedDoc) return;
    try {
      const stateAny: any = (location && (location.state as any)) || {};
      const previewUrl = stateAny.previewUrl || new URLSearchParams(location.search).get('file');
      // Determine the recipient email from location state or query param (used for unauthenticated signing links)
      const recipientFromState = stateAny.recipientEmail || stateAny.email || new URLSearchParams(location.search).get('recipient') || new URLSearchParams(location.search).get('email');
      if (recipientFromState) setCurrentSignerEmail(recipientFromState as string);
      if (previewUrl) {
        setDocument(previewUrl, 'pdf');
      }
    } catch (e) {
      // ignore malformed URL or missing params
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If a user is logged in, prefer their email as the signer identity
  useEffect(() => {
    if (user?.email) setCurrentSignerEmail(user.email);
  }, [user]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const [activeField, setActiveField] = useState<any>(null);
  const [placingSignature, setPlacingSignature] = useState(false);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [onlyShowFieldId, setOnlyShowFieldId] = useState<string | null>(null);
  const [signatureZoom, setSignatureZoom] = useState<{[key: string]: number}>({});
  const dragRef = useRef<{ id: string | null; page: number | null; dragging: boolean; pageRect: DOMRect | null }>({ id: null, page: null, dragging: false, pageRect: null });

  // Drag handlers for signer to move their signature overlay
  function handleDragMove(ev: any) {
    if (!dragRef.current.dragging || !dragRef.current.id) return;
    try {
      ev.preventDefault?.();
    } catch (e) {}
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    const rect = dragRef.current.pageRect || (dragRef.current.page ? pageRefs.current[dragRef.current.page]?.getBoundingClientRect() : null);
    if (!rect) return;
    let relX = ((clientX - rect.left) / rect.width) * 100;
    let relY = ((clientY - rect.top) / rect.height) * 100;
    relX = Math.max(0, Math.min(100, relX));
    relY = Math.max(0, Math.min(100, relY));
    setFields((prev: any[]) => prev.map((f: any) => f.id === dragRef.current.id ? { ...f, x: relX, y: relY } : f));
  }

  function handleDragEnd(_ev?: any) {
    dragRef.current.dragging = false;
    dragRef.current.id = null;
    dragRef.current.page = null;
    dragRef.current.pageRect = null;
    try {
      document.removeEventListener('mousemove', handleDragMove as any);
      document.removeEventListener('mouseup', handleDragEnd as any);
      document.removeEventListener('touchmove', handleDragMove as any);
      document.removeEventListener('touchend', handleDragEnd as any);
    } catch (e) {}
  }

  const startDrag = (field: any, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const pageEl = pageRefs.current[field.page];
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    dragRef.current = { id: field.id, page: field.page, dragging: true, pageRect: rect };
    document.addEventListener('mousemove', handleDragMove as any);
    document.addEventListener('mouseup', handleDragEnd as any);
    document.addEventListener('touchmove', handleDragMove as any, { passive: false } as any);
    document.addEventListener('touchend', handleDragEnd as any);
  };

  // Helper to find signature fields assigned to this signer (case-insensitive match)
  const findAssignedSignatures = () => {
    const signerEmail = (currentSignerEmail || user?.email || '').toString().toLowerCase();
    return (fields || []).filter((f: any) => f.type === 'signature' && !f.completed && (
      !f.recipient || f.recipient === 'Signer' || (signerEmail && (f.recipient || '').toString().toLowerCase() === signerEmail)
    )).sort((a: any, b: any) => (a.page - b.page) || (a.y - b.y));
  };

  const handleNextSignature = () => {
    const assigned = findAssignedSignatures();
    if (!assigned || assigned.length === 0) return;
    let next = assigned.find((f: any) => f.page > currentPage) || assigned.find((f: any) => f.page === currentPage) || assigned[0];
    if (!next) next = assigned[0];
    if (!next) return;

    // Scroll to the exact field position within the scroll container (center it)
    const container = scrollContainerRef.current;
    if (container) {
      const pageOffset = (next.page - 1) * (PAGE_HEIGHT + PAGE_GAP);
      const topInDoc = pageOffset + (next.y / 100) * PAGE_HEIGHT;
      // Place the field slightly above center so the box and highlight appear a bit higher in view
      const scrollTarget = Math.max(0, topInDoc - (container.clientHeight * 0.35));
      container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    } else {
      scrollToPage(next.page);
    }

    // After scrolling, highlight the field briefly (do NOT open modal)
    setTimeout(() => {
      setHighlightedFieldId(next.id);
      // Try to ensure the highlighted field is visible in the browser viewport as well
      try {
        const el = document.querySelector(`[data-field-id="${next.id}"]`) as HTMLElement | null;
        if (el) {
          // Nudge the page so the field sits a bit lower from the top of the viewport (so it's visually higher)
          const rect = el.getBoundingClientRect();
          const desiredTopOffset = 120; // px from top
          const scrollBy = rect.top - desiredTopOffset;
          if (Math.abs(scrollBy) > 8) {
            window.scrollBy({ top: scrollBy, behavior: 'smooth' });
          }
        }
      } catch (e) {}
      setTimeout(() => setHighlightedFieldId(null), 2400);
    }, 450);
  };

  // NEXT button vertical offset in inches (convert to px at 96dpi)
  const NEXT_OFFSET_INCHES = 2;
  const NEXT_OFFSET_PX = NEXT_OFFSET_INCHES * 96;

  // PDF Page dimensions (standard A4 at 96 DPI)
  const PAGE_HEIGHT = 1056;
  const PAGE_WIDTH = 816;
  const PAGE_GAP = 20;

  // Track current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollTop = scrollContainerRef.current.scrollTop;
      const newPage = Math.floor(scrollTop / (PAGE_HEIGHT + PAGE_GAP)) + 1;
      if (newPage !== currentPage && newPage <= numPages && newPage >= 1) {
        setCurrentPage(newPage);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, numPages]);

  const scrollToPage = (pageNum: number) => {
    const targetY = (pageNum - 1) * (PAGE_HEIGHT + PAGE_GAP);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
    setCurrentPage(pageNum);
  };

  const handleFieldClick = (field: any, e?: MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Field clicked:', field);
    // Only allow opening signature modal if the field is assigned to this signer (or is a generic 'Signer' field)
    // Match recipient email case-insensitively and fall back to logged-in user's email if currentSignerEmail is not set.
    const assignedRecipient = (field.recipient || '').toString();
    const signerEmail = (currentSignerEmail || user?.email || '').toString();
    const isAssignedToThis = !assignedRecipient || assignedRecipient === 'Signer' || (
      signerEmail && assignedRecipient.toLowerCase() === signerEmail.toLowerCase()
    );
    // Admins are allowed special behavior (auto-sign)
    const isAdmin = user?.role === 'admin';

    if (!isAssignedToThis && !isAdmin) {
      console.log('Field is not assigned to this signer; ignoring click');
      return;
    }

    setActiveField(field);
    
    if (field.type === 'signature') {
      // For admin users, do not open the popup — autofill and mark completed inline
      if (user?.role === 'admin') {
        try { e?.preventDefault(); e?.stopPropagation(); } catch (err) {}
        setShowSignatureModal(false);
        const adminSig = `Signed by ${user.email}`;
        setFieldValues((prev: any) => ({ ...prev, [field.id]: adminSig, [field.id + '_type']: 'text', [field.id + '_font']: 'Dancing Script' }));
        setFields(fields.map((f: any) => f.id === field.id ? { ...f, completed: true } : f));
        setActiveField(null);
        return;
      }
      console.log('Opening signature modal');
      setTimeout(() => setShowSignatureModal(true), 0);
    }
    else if (field.type === 'initial') {
      setTimeout(() => setShowInitialModal(true), 0);
    }
    else if (field.type === 'date') {
      setTimeout(() => setShowDateModal(true), 0);
    }
    else if (field.type === 'text') {
      setTimeout(() => setShowTextModal(true), 0);
    }
    else if (field.type === 'checkbox') {
      setFieldValues({ ...fieldValues, [field.id]: !fieldValues[field.id] });
      setFields(fields.map((f: any) => f.id === field.id ? { ...f, completed: !fieldValues[field.id] } : f));
    }
  };

  const handleSaveSignature = (signature: string, type: string, font?: string) => {
    if (activeField) {
      setFieldValues({
        ...fieldValues,
        [activeField.id]: signature,
        [activeField.id + '_type']: type,
        [activeField.id + '_font']: font
      });
      // compute updated fields so we can check completion and optionally navigate
      const newFields = fields.map((f: any) => f.id === activeField.id ? { ...f, completed: true } : f);
      setFields(newFields);
      setActiveField(null);
    }

    setShowSignatureModal(false);
  };

  const handleSaveInitial = (initial: string) => {
    if (activeField) {
      setFieldValues({ ...fieldValues, [activeField.id]: initial });
      setFields(fields.map((f: any) => f.id === activeField.id ? { ...f, completed: true } : f));
    }
    setShowInitialModal(false);
    setActiveField(null);
  };

  const handleSaveText = (text: string) => {
    if (activeField) {
      setFieldValues({ ...fieldValues, [activeField.id]: text });
      setFields(fields.map((f: any) => f.id === activeField.id ? { ...f, completed: true } : f));
    }
    setShowTextModal(false);
    setActiveField(null);
  };

  const handleSaveDate = (date: string) => {
    if (activeField) {
      setFieldValues({ ...fieldValues, [activeField.id]: date });
      setFields(fields.map((f: any) => f.id === activeField.id ? { ...f, completed: true } : f));
    }
    setShowDateModal(false);
    setActiveField(null);
  };

  // Generate a flattened PDF with signatures drawn/embedded onto pages (client-side)
  const generateSignedPdf = async () => {
    if (!uploadedDoc) {
      console.error('No document available to sign');
      return;
    }

    try {
      // Load source PDF
      let arrayBuffer: ArrayBuffer;
      if (typeof uploadedDoc === 'string') {
        const res = await fetch(uploadedDoc);
        arrayBuffer = await res.arrayBuffer();
      } else {
        arrayBuffer = await (uploadedDoc as File).arrayBuffer();
      }

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // For each field that has a saved value, draw it onto the PDF page
      for (const field of (fields || [])) {
        const value = fieldValues[field.id];
        if (!value) continue;
        const pageIndex = Math.max(0, Math.min((field.page || 1) - 1, pages.length - 1));
        const page = pages[pageIndex];
        const { width: pageW, height: pageH } = page.getSize();

        // compute position: field.x/field.y are percentages from left/top
        const x = (field.x / 100) * pageW;
        const yTop = (field.y / 100) * pageH; // distance from top

        // choose box size (~25% of page width)
        const boxW = Math.max(80, pageW * 0.25);

        const valueType = fieldValues[field.id + '_type'] || 'type';
        if (valueType === 'draw' || valueType === 'upload') {
          // value is a data URL
          try {
            const dataUrl: string = value;
            const base64 = dataUrl.split(',')[1];
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            let img: any;
            if (dataUrl.startsWith('data:image/png') || dataUrl.startsWith('data:image/webp')) {
              img = await pdfDoc.embedPng(bytes);
            } else {
              img = await pdfDoc.embedJpg(bytes);
            }
            const imgDims = img.scale(1);
            const scale = Math.min(1, boxW / imgDims.width);
            const drawW = imgDims.width * scale;
            const drawH = imgDims.height * scale;
            const xPos = x;
            const yPos = pageH - yTop - drawH; // convert top-origin to pdf bottom-origin
            page.drawImage(img, { x: xPos, y: yPos, width: drawW, height: drawH });
          } catch (e) {
            console.error('Failed to embed image signature', e);
          }
        } else {
          // typed signature: draw text
          const text: string = value;
          const fontSize = 28;
          const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
          const size = textWidth > boxW ? (boxW / textWidth) * fontSize : fontSize;
          const xPos = x;
          const yPos = pageH - yTop - size;
          page.drawText(text, { x: xPos, y: yPos, size, font: helvetica, color: rgb(0, 0, 0) });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = (typeof uploadedDoc === 'string') ? 'signed-document.pdf' : `signed-${(uploadedDoc as File).name || 'document'}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate signed PDF', err);
    }
  };

  const removeSignature = (id: number) => {
    setSignatures(signatures.filter(s => s.id !== id));
  };

  const addNewSignature = () => {
    // If admin, don't open the signature modal — auto-add an inline signature
    if (user?.role === 'admin') {
      const newSig: Signature = {
        id: Date.now(),
        data: `Signed by ${user.email}`,
        type: 'type',
        font: 'Dancing Script',
        x: 10,
        y: 20,
        width: 40,
        height: 10,
        page: currentPage
      };
      setSignatures((s) => [...s, newSig]);
      return;
    }

    // For signers, toggle placement mode: the next click on the document will add a signature field
    setPlacingSignature((p) => !p);
    setActiveField(null);
  };

  // Calculate field position based on page number and percentage
  const getFieldPosition = (field: any) => {
    // Calculate absolute position based on page number
    const pageOffset = (field.page - 1) * (PAGE_HEIGHT + PAGE_GAP);
    const topPercentInPage = (field.y / 100) * PAGE_HEIGHT;
    
    return {
      left: `${field.x}%`,
      top: `${pageOffset + topPercentInPage}px`
    };
  };

  // PDF load success handler
  const handlePdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky NEXT button: jumps to next assigned signature and highlights its location (non-admin only) */}
      {user?.role !== 'admin' && findAssignedSignatures().length > 0 && (
        <button
          onClick={handleNextSignature}
          title="Next signature"
          className="fixed bg-blue-600 border border-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 z-50 select-none"
          style={{ left: '1rem', top: `calc(50% - ${NEXT_OFFSET_INCHES * 96}px)`, caretColor: 'transparent' }}
          onMouseDown={(e) => e.currentTarget.focus()} /* keep focus for keyboard but avoid editable caret */
        >
          NEXT
        </button>
      )}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Review and Sign Document</h1>
              <p className="text-sm text-gray-600">Place your signature on the document</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
                <X className="h-5 w-5" />
                <span>Decline</span>
              </button>
              <button
                onClick={() => {
                  // Allow users to complete even if not all fields are filled.
                  // If some fields are still empty, we open the signature modal if an active field exists,
                  // otherwise proceed to mark document as completed (client flow may differ).
                  if (activeField && activeField.type === 'signature') {
                    setShowSignatureModal(true);
                    return;
                  }
                  // As a fallback, mark all fields as completed to allow completion, then show thank you
                  try {
                    const newFields = fields.map((f: any) => ({ ...f, completed: true }));
                    setFields(newFields);
                    // navigate to thank-you / success page so signer sees completion
                    navigate('/send/success');
                  } catch (e) {}
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Check className="h-5 w-5" />
                <span>Sign & Complete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Page {currentPage} of {numPages}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await generateSignedPdf();
                        } catch (e) { console.error(e); }
                      }}
                      className="px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600"
                    >
                      Download signed PDF
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={addNewSignature}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${placingSignature ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        <PenTool className="h-4 w-4" />
                        <span>{placingSignature ? 'Place signature (click document)' : 'Add Signature'}</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Scrollable PDF Container */}
                <div
                  ref={scrollContainerRef}
                  className="bg-gray-100 rounded-lg overflow-y-auto relative"
                  style={{ height: '800px' }}
                >
                  {uploadedDoc && docType === 'pdf' ? (
                    <div 
                      className="relative mx-auto"
                      style={{ 
                        width: `${PAGE_WIDTH}px`,
                        height: `${(PAGE_HEIGHT + PAGE_GAP) * numPages - PAGE_GAP}px`
                      }}
                      onClick={(e) => {
                        if (!placingSignature) return;
                        // Determine which page was clicked using page refs
                        const clickX = (e as React.MouseEvent).clientX;
                        const clickY = (e as React.MouseEvent).clientY;
                        let clickedPage: number | null = null;
                        let relX = 0;
                        let relY = 0;
                        for (let p = 1; p <= numPages; p++) {
                          const el = pageRefs.current[p];
                          if (!el) continue;
                          const rect = el.getBoundingClientRect();
                          if (clickX >= rect.left && clickX <= rect.right && clickY >= rect.top && clickY <= rect.bottom) {
                            clickedPage = p;
                            relX = ((clickX - rect.left) / rect.width) * 100;
                            relY = ((clickY - rect.top) / rect.height) * 100;
                            break;
                          }
                        }
                        if (!clickedPage) return;
                        const newField = {
                          id: `field_${Date.now()}`,
                          type: 'signature',
                          x: relX,
                          y: relY,
                          completed: false,
                          recipient: 'Signer',
                          page: clickedPage
                        } as any;
                        setFields([...fields, newField]);
                        setActiveField(newField);
                        // Exit placement mode. The user should click the new field to open the signature modal.
                        setPlacingSignature(false);
                      }}
                    >
                      {/* Render Pages */}
                      {[...Array(numPages)].map((_, pageIndex) => {
                        const pageNum = pageIndex + 1;
                        return (
                          <div
                            key={pageNum}
                            ref={el => pageRefs.current[pageNum] = el}
                            className="bg-white shadow-lg mx-auto"
                            style={{
                              width: `${PAGE_WIDTH}px`,
                              height: `${PAGE_HEIGHT}px`,
                              marginBottom: pageNum < numPages ? `${PAGE_GAP}px` : '0',
                              position: 'relative'
                            }}
                          >
                            {/* PDF Page Content - Use react-pdf */}
                            <Document
                              file={uploadedDoc}
                              onLoadSuccess={handlePdfLoadSuccess}
                              loading={<div className="p-8 text-center">Loading PDF...</div>}
                            >
                              <Page
                                pageNumber={pageNum}
                                width={PAGE_WIDTH}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                              />
                            </Document>
                          </div>
                        );
                      })}

                      {/* Field Overlays - Positioned absolutely within the document */}
                      {fields.map((field: any) => {
                        // For non-admin (signer) users with signature fields: show signature-only display (no border, no labels)
                        const isSignerSignatureField = user?.role !== 'admin' && field.type === 'signature' && fieldValues[field.id];
                        const zoomLevel = signatureZoom[field.id] || 1;
                        
                        // Hide field if onlyShowFieldId mode is active and this isn't the target field
                        if (onlyShowFieldId && field.id !== onlyShowFieldId) return null;

                        return (
                          <div
                            key={field.id}
                            data-field-id={field.id}
                            style={{ 
                              position: 'absolute',
                              ...getFieldPosition(field),
                              zIndex: 200, 
                              cursor: (user?.role === 'admin' || !field.recipient || field.recipient === 'Signer' || (currentSignerEmail && field.recipient === currentSignerEmail)) ? 'pointer' : 'not-allowed',
                              pointerEvents: 'auto',
                              width: 'auto',
                              minWidth: isSignerSignatureField ? 'auto' : '120px'
                            }}
                            onClick={(e) => {
                              // If the field isn't assigned to this signer and not admin, clicks are ignored due to pointerEvents 'none'
                              if (!isSignerSignatureField) {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFieldClick(field, e);
                              }
                            }}
                            className={isSignerSignatureField ? 'relative group' : `px-3 py-2 rounded border bg-white shadow-lg hover:shadow-xl transition-all duration-200 field-container ${
                              field.completed ? 'border-green-500 bg-green-50' : 'border-red-400 border-2 bg-red-50'
                            } ${highlightedFieldId === field.id ? 'ring-4 ring-blue-300 ring-opacity-75' : ''}`}
                          >
                            {isSignerSignatureField ? (
                              // Signature-only display for signers: no border, no labels, just the signature image/text with zoom controls
                              <>
                                <div
                                  onMouseDown={(e) => startDrag(field, e)}
                                  onTouchStart={(e) => startDrag(field, e)}
                                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', cursor: 'grab' }}
                                >
                                  {fieldValues[field.id + '_type'] === 'draw' || fieldValues[field.id + '_type'] === 'upload' ? (
                                    <img src={fieldValues[field.id]} alt="Signature" className="h-16 max-w-full object-contain" style={{ minHeight: '64px' }} />
                                  ) : (
                                    <span 
                                      className="text-3xl whitespace-nowrap"
                                      style={{ fontFamily: fieldValues[field.id + '_font'] || 'Dancing Script' }}
                                    >
                                      {fieldValues[field.id]}
                                    </span>
                                  )}
                                </div>
                                {/* Zoom controls - show on hover */}
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white/90 rounded px-2 py-1 shadow-md" style={{ transform: 'translateX(100%)' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSignatureZoom(prev => ({ ...prev, [field.id]: Math.max(0.5, (prev[field.id] || 1) - 0.1) }));
                                    }}
                                    className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                    title="Zoom out"
                                  >
                                    −
                                  </button>
                                  <span className="text-xs text-gray-600 px-1">{Math.round(zoomLevel * 100)}%</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSignatureZoom(prev => ({ ...prev, [field.id]: Math.min(3, (prev[field.id] || 1) + 0.1) }));
                                    }}
                                    className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                    title="Zoom in"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSignatureZoom(prev => ({ ...prev, [field.id]: 1 }));
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                                    title="Reset zoom"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </>
                            ) : (
                              // Standard field display with border and labels (for admins and unsigned fields)
                              <>
                                <div className="flex items-center space-x-2 min-w-[120px]">
                                  {field.type === 'signature' && (
                                    fieldValues[field.id] ? (
                                      fieldValues[field.id + '_type'] === 'draw' || fieldValues[field.id + '_type'] === 'upload' ? (
                                        <img src={fieldValues[field.id]} alt="Signature" className="h-6 max-w-[80px] object-contain" />
                                      ) : (
                                        <span 
                                          className="text-lg whitespace-nowrap"
                                          style={{ fontFamily: fieldValues[field.id + '_font'] || 'Dancing Script' }}
                                        >
                                          {fieldValues[field.id]}
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                                        ✍️ Click to Sign
                                      </span>
                                    )
                                  )}
                                  {field.type === 'initial' && (
                                    fieldValues[field.id] ? 
                                      <span className="text-lg font-semibold">{fieldValues[field.id]}</span> : 
                                      <span className="text-sm font-medium text-red-600">Initial</span>
                                  )}
                                  {field.type === 'date' && (
                                    fieldValues[field.id] ? 
                                      <span className="text-sm">{fieldValues[field.id]}</span> : 
                                      <span className="text-sm font-medium text-red-600">📅 Date</span>
                                  )}
                                  {field.type === 'text' && (
                                    fieldValues[field.id] ? 
                                      <span className="text-sm">{fieldValues[field.id]}</span> : 
                                      <span className="text-sm font-medium text-red-600">📝 Text</span>
                                  )}
                                  {field.type === 'checkbox' && (
                                    <input 
                                      type="checkbox" 
                                      checked={!!fieldValues[field.id]} 
                                      readOnly 
                                      className="h-4 w-4"
                                    />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 text-center">
                                  {((field.recipient === 'Signer' || (currentSignerEmail && field.recipient === currentSignerEmail) || user?.role === 'admin') ? 'Your field • ' : '')}Page {field.page}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* Static signatures added in Sign.tsx */}
                      {signatures.map((sig) => {
                        const sigPageOffset = (sig.page - 1) * (PAGE_HEIGHT + PAGE_GAP);
                        const sigTopInPage = (sig.y / 100) * PAGE_HEIGHT;
                        
                        return (
                          <div
                            key={sig.id}
                            style={{
                              position: 'absolute',
                              left: `${sig.x}%`,
                              top: `${sigPageOffset + sigTopInPage}px`,
                              width: `${sig.width}%`,
                              zIndex: 300,
                              pointerEvents: 'auto',
                            }}
                            className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-2 hover:shadow-xl transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Signature • Page {sig.page}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSignature(sig.id);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-center">
                              {sig.type === 'draw' || sig.type === 'upload' ? (
                                <img src={sig.data} alt="Signature" className="max-h-12 max-w-full object-contain" />
                              ) : (
                                <span style={{ fontFamily: sig.font }} className="text-2xl">
                                  {sig.data}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center h-full flex items-center justify-center">
                      <div>
                        <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p className="text-gray-500">Document preview area</p>
                        <p className="text-sm text-gray-400 mt-2">Upload a document or add signatures to get started</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Page Navigation */}
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <button
                    onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages}
                    className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">1</div>
                  <p>Scroll through document to view all pages</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">2</div>
                  <p>Click on red fields to fill them</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">3</div>
                  <p>Fields stay bound to their assigned pages</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">4</div>
                  <p>Click "Sign & Complete" when finished</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Fields</h3>
              <p className="text-sm text-gray-600 mb-4">
                {fields.filter((f: any) => f.completed).length} of {fields.length} fields completed
              </p>
              {fields.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {fields.map((field: any, idx: number) => (
                    <div 
                      key={field.id} 
                      className="bg-white rounded-lg p-3 text-sm flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        scrollToPage(field.page);
                        // If this is a signature field assigned to the current signer, open the signature modal
                        if (field.type === 'signature') {
                          handleFieldClick(field as any);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${field.completed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-700 font-medium capitalize">{field.type} {idx + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">Page {field.page}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No fields added yet</p>
              )}
            </div>

            <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Tips</h3>
              <ul className="text-sm text-amber-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use navigation buttons or scroll to move between pages</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Click field names in sidebar to jump to their page</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Green fields are completed, red need attention</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>All fields must be completed before signing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {user?.role !== 'admin' && (
        <SignatureModal
          isOpen={showSignatureModal}
          onClose={() => {
            setShowSignatureModal(false);
            setActiveField(null);
          }}
          onSave={handleSaveSignature}
        />
      )}
      <InitialModal
        isOpen={showInitialModal}
        onClose={() => {
          setShowInitialModal(false);
          setActiveField(null);
        }}
        onSave={handleSaveInitial}
      />
      <TextFieldModal
        isOpen={showTextModal}
        onClose={() => {
          setShowTextModal(false);
          setActiveField(null);
        }}
        onSave={handleSaveText}
        fieldLabel="Full Name"
        placeholder=""
      />
      <DateFieldModal
        isOpen={showDateModal}
        onClose={() => {
          setShowDateModal(false);
          setActiveField(null);
        }}
        onSave={handleSaveDate}
      />
    </div>
  );
}