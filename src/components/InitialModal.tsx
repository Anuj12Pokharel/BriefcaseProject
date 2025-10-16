import { useState, useRef, useEffect } from 'react';
import { X, PenTool, Type, Upload, Check, RotateCcw } from 'lucide-react';

interface InitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (initial: string, type: string) => void;
}

export default function InitialModal({ isOpen, onClose, onSave }: InitialModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedInitial, setTypedInitial] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current && activeTab === 'draw') {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        contextRef.current = context;
      }
    }
  }, [activeTab]);

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

  const handleSave = () => {
    if (activeTab === 'draw' && canvasRef.current) {
      const initial = canvasRef.current.toDataURL();
      onSave(initial, 'draw');
    } else if (activeTab === 'type' && typedInitial) {
      onSave(typedInitial, 'type');
    } else if (activeTab === 'upload' && uploadedImage) {
      onSave(uploadedImage, 'upload');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Add Your Initials</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                activeTab === 'draw'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PenTool className="h-5 w-5" />
              <span>Draw</span>
            </button>
            <button
              onClick={() => setActiveTab('type')}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                activeTab === 'type'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Type className="h-5 w-5" />
              <span>Type</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>Upload</span>
            </button>
          </div>

          {activeTab === 'draw' && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Draw your initials using your mouse or touchpad</p>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-48 border-2 border-gray-300 rounded-lg cursor-crosshair bg-white touch-none"
              />
              <div className="flex justify-end mt-3">
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

          {activeTab === 'type' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type your initials</label>
              <input
                type="text"
                value={typedInitial}
                onChange={(e) => setTypedInitial(e.target.value.toUpperCase())}
                placeholder="JS"
                maxLength={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-center font-semibold"
              />
              {typedInitial && (
                <div className="mt-4 bg-gray-50 rounded-lg p-8 border border-gray-200 flex items-center justify-center min-h-[120px]">
                  <span className="text-5xl font-serif text-gray-900" style={{ fontFamily: 'Dancing Script' }}>
                    {typedInitial}
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              {!uploadedImage ? (
                <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <p className="text-gray-600 mb-4">Upload an image of your initials</p>
                  <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                    Browse Files
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 flex items-center justify-center min-h-[150px]">
                    <img src={uploadedImage} alt="Uploaded initial" className="max-h-24 object-contain" />
                  </div>
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Choose Different Image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={(activeTab === 'draw' && !hasDrawn) || (activeTab === 'type' && !typedInitial) || (activeTab === 'upload' && !uploadedImage)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Check className="h-5 w-5" />
            <span>Adopt and Sign</span>
          </button>
        </div>
      </div>
    </div>
  );
}
