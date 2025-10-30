import Sign from './Sign';

export default function SignAndSend() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Stepper UI */}
      <div className="flex items-center justify-center mb-8">
        <Step active label="Publication details" />
        <Step active label="Upload" />
        <Step active={false} label="Confirm" />
      </div>
      {/* Sign and Send combined */}
      <Sign />
      {/* Add send UI here if needed */}
    </div>
  );
}

function Step({ active, label }: { active: boolean, label: string }) {
  return (
    <div className="flex items-center">
      <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg border-2 ${active ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 text-gray-400 border-gray-300'}`}>{active ? <span>&#10003;</span> : <span>3</span>}</div>
      <span className={`ml-2 mr-6 font-medium ${active ? 'text-teal-700' : 'text-gray-400'}`}>{label}</span>
      <div className="w-16 h-0.5 bg-gray-200 mx-2" />
    </div>
  );
}