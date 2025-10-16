import { useState, useRef, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string, type: string, font?: string) => void;
  initialPosition?: { x: number; y: number } | null;
}

export default function SignatureModal({ isOpen, onClose, onSave, initialPosition }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'draw' | 'upload'>('type');
  const [fullName, setFullName] = useState('');
  const [initials, setInitials] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current && activeTab === 'draw' && isOpen) {
      const canvas = canvasRef.current;
      const parentWidth = canvas.parentElement?.offsetWidth || 800;
      canvas.width = parentWidth * 2;
      canvas.height = 400;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = '200px';

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        contextRef.current = context;
      }
    }
  }, [activeTab, isOpen]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!contextRef.current) return;
    const coords = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !contextRef.current) return;
    const coords = getCoordinates(e);
    contextRef.current.lineTo(coords.x, coords.y);
    contextRef.current.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasDrawn(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (activeTab === 'draw' && canvasRef.current && hasDrawn) {
      const signature = canvasRef.current.toDataURL();
      onSave(signature, 'draw');
    } else if (activeTab === 'type' && fullName) {
      onSave(fullName, 'type', selectedFont);
    } else if (activeTab === 'upload' && uploadedImage) {
      onSave(uploadedImage, 'upload');
    }
  };

  const fonts = [
    'Dancing Script',
    'Great Vibes',
    'Pacifico',
    'Allura',
    'Alex Brush',
    'Sacramento'
  ];
  // Draggable modal state
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  // When opened with an initialPosition, place the modal near that point (above click)
  useEffect(() => {
    if (!isOpen) return;
    if (!initialPosition) {
      setPosition(null);
      return;
    }
    // Wait a frame for modal to mount and size to be available
    requestAnimationFrame(() => {
      const rect = modalRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 700;
      const h = rect?.height ?? 400;
      // Center the modal on the click point
      const left = initialPosition.x - w / 2;
      const top = initialPosition.y - h / 2;
      setPosition(clamp(left, top));
    });
  }, [isOpen, initialPosition]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      setPosition(clamp(nx, ny));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  function clamp(nx: number, ny: number) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = modalRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 700;
    const h = rect?.height ?? 400;
    const x = Math.max(8, Math.min(vw - w - 8, nx));
    const y = Math.max(8, Math.min(vh - h - 8, ny));
    return { x, y };
  }

  const startDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(true);
    const rect = modalRef.current?.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    dragOffset.current = { x: cx - (rect?.left ?? 0), y: cy - (rect?.top ?? 0) };
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 p-4" 
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={position ? { position: 'fixed', left: position.x, top: position.y, transform: 'none' as const } : { margin: '0 auto' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 cursor-move" onMouseDown={startDrag}>
          <h2 className="text-2xl font-semibold text-gray-800">Adopt Your Signature</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Confirm your name, initials, and signature.</p>
          
          {/* Full Name and Initials */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Frank Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Initials
              </label>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder="FS"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('type')}
              className={`pb-2 px-1 font-medium transition-all ${
                activeTab === 'type'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Select Style
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`pb-2 px-1 font-medium transition-all ${
                activeTab === 'draw'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2 px-1 font-medium transition-all ${
                activeTab === 'upload'
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Use Signature Pad
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'type' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose a signature style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        onClick={() => setSelectedFont(font)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          selectedFont === font
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="text-2xl text-gray-900"
                          style={{ fontFamily: font }}
                        >
                          {fullName || 'Your Name'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {fullName && (
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 flex items-center justify-center min-h-[120px] mt-4">
                    <span
                      className="text-4xl text-gray-900"
                      style={{ fontFamily: selectedFont }}
                    >
                      {fullName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'draw' && (
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-700 font-semibold uppercase">Draw Your Signature on the Signature Pad</p>
                    <button
                      className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Start Capture
                    </button>
                  </div>
                  <div className="border-2 border-gray-300 rounded-lg bg-white relative" style={{ height: '200px' }}>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-full cursor-crosshair touch-none absolute top-0 left-0 rounded-lg"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-gray-400 text-lg font-serif">IntegriSign</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={clearCanvas}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload an image of your signature (PNG, JPG, or GIF)
                </p>

                {!uploadedImage ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Drag and drop your signature image
                      </h3>
                      <p className="text-gray-600 mb-4">or</p>
                      <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-4">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 flex items-center justify-center min-h-[200px] mb-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded signature"
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Choose Different Image</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Agreement Text */}
          <div className="mt-6 mb-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              By selecting Adopt and Sign, I agree that the signature and initials will be the electronic representation of my signature and initials for all purposes when I (or my agent) use them on documents, including legally binding contracts - just the same as a pen-and-paper signature or initial.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors uppercase text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              (activeTab === 'draw' && !hasDrawn) ||
              (activeTab === 'type' && !fullName) ||
              (activeTab === 'upload' && !uploadedImage)
            }
            className="bg-cyan-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed uppercase text-sm"
          >
            Adopt and Sign
          </button>
        </div>
      </div>
    </div>
  );
}