import { useNavigate } from 'react-router-dom';

export default function SendSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Thank you!</h1>
        <p className="text-gray-700 mb-6">Thank you for using our services. Your document has been sent to all recipients.</p>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
