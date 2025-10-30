import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-based index
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center min-w-[120px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white border-green-500'
                    : isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-gray-200 text-gray-500 border-gray-300'
                }`}
              >
                {isCompleted ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M5 10l3 3 7-7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'text-green-700'
                    : isCurrent
                    ? 'text-blue-700 font-bold'
                    : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex items-center mx-2">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 12h24m0 0l-6-6m6 6l-6 6"
                    stroke={isCompleted ? '#22c55e' : isCurrent ? '#2563eb' : '#d1d5db'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
