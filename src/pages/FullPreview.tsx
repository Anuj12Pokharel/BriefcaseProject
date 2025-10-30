import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDocument } from '../context/DocumentContext';

export default function FullPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const previewUrl = (location.state as any)?.previewUrl as string | undefined;
  const { uploadedDoc } = useDocument();
  const [internalUrl, setInternalUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // if no previewUrl provided in navigation state, try to build one from context
    if (!previewUrl && uploadedDoc) {
      if (typeof uploadedDoc === 'string') {
        setInternalUrl(uploadedDoc);
        return;
      }
      const file = uploadedDoc as File;
      const url = URL.createObjectURL(file);
      setInternalUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    return;
  }, [previewUrl, uploadedDoc]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-4 p-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">Full Page Preview</h2>
      </div>
      <div className="h-[calc(100vh-64px)]">
        { (previewUrl || internalUrl) ? (
          <iframe title="Full preview" src={previewUrl || internalUrl} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">No preview available</div>
        )}
      </div>
    </div>
  );
}
