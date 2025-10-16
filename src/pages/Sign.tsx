import React, { useState, useRef, useEffect } from "react";
import { Check, X, PenTool, ChevronUp, ChevronDown } from "lucide-react";
import SignatureModal from '../components/SignatureModal';
import InitialModal from '../components/InitialModal';
import TextFieldModal from '../components/TextFieldModal';
import DateFieldModal from '../components/DateFieldModal';
import { useDocument } from '../context/DocumentContext';

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
  const [totalPages] = useState(3); // Will be dynamic based on PDF

  const { uploadedDoc, docType, fields, setFields, fieldValues, setFieldValues } = useDocument();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const [activeField, setActiveField] = useState<any>(null);

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
      if (newPage !== currentPage && newPage <= totalPages && newPage >= 1) {
        setCurrentPage(newPage);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, totalPages]);

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

  const handleFieldClick = (field: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Field clicked:', field);
    setActiveField(field);
    
    if (field.type === 'signature') {
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
      setFields(fields.map((f: any) => f.id === activeField.id ? { ...f, completed: true } : f));
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

  const removeSignature = (id: number) => {
    setSignatures(signatures.filter(s => s.id !== id));
  };

  const addNewSignature = () => {
    setShowSignatureModal(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
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
                disabled={!fields.every((f: any) => f.completed)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                      <span>Page {currentPage} of {totalPages}</span>
                    </div>
                    <button
                      onClick={addNewSignature}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <PenTool className="h-4 w-4" />
                      <span>Add Signature</span>
                    </button>
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
                        height: `${(PAGE_HEIGHT + PAGE_GAP) * totalPages - PAGE_GAP}px`
                      }}
                    >
                      {/* Render Pages */}
                      {[...Array(totalPages)].map((_, pageIndex) => {
                        const pageNum = pageIndex + 1;
                        return (
                          <div
                            key={pageNum}
                            ref={el => pageRefs.current[pageNum] = el}
                            className="bg-white shadow-lg mx-auto"
                            style={{
                              width: `${PAGE_WIDTH}px`,
                              height: `${PAGE_HEIGHT}px`,
                              marginBottom: pageNum < totalPages ? `${PAGE_GAP}px` : '0',
                              position: 'relative'
                            }}
                          >
                            {/* PDF Page Content - Replace with actual PDF rendering */}
                            <iframe
                              src={`${uploadedDoc}#page=${pageNum}`}
                              title={`PDF Page ${pageNum}`}
                              className="w-full h-full border-0"
                              style={{ pointerEvents: 'none' }}
                            />
                          </div>
                        );
                      })}

                      {/* Field Overlays - Positioned absolutely within the document */}
                      {fields.map((field: any) => (
                        <div
                          key={field.id}
                          style={{ 
                            position: 'absolute',
                            ...getFieldPosition(field),
                            zIndex: 200, 
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            width: 'auto',
                            minWidth: '120px'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFieldClick(field, e);
                          }}
                          className={`px-3 py-2 rounded border bg-white shadow-lg hover:shadow-xl transition-all duration-200 field-container ${
                            field.completed ? 'border-green-500 bg-green-50' : 'border-red-400 border-2 bg-red-50'
                          }`}
                        >
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
                            {field.recipient || 'Signer'} • Page {field.page}
                          </div>
                        </div>
                      ))}

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
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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
                      onClick={() => scrollToPage(field.page)}
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
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setActiveField(null);
        }}
        onSave={handleSaveSignature}
      />
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