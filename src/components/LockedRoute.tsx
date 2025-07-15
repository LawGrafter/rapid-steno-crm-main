import React from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';

interface LockedRouteProps {
  children: React.ReactNode;
  featureName: string;
}

const LockedRoute: React.FC<LockedRouteProps> = ({ children, featureName }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Feature Locked</h2>
          <p className="text-gray-600 mb-6">
            The <span className="font-medium">{featureName}</span> feature is currently locked and not available in this version.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
            <AlertCircle className="w-4 h-4" />
            <span>Only Dashboard and Leads are currently accessible</span>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors mr-3"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockedRoute; 