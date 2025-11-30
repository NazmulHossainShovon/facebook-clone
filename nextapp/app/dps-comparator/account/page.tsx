'use client';

import React, { useContext } from 'react';
import { Store } from '../../lib/store';
import ProtectedRoute from 'components/ProtectedRoute';

const DpsAccountPage = () => {
  const {
    state: { userInfo },
  } = useContext(Store);

  // Using actual user data
  const remainingDpsCalcLimit = userInfo?.remainingDpsCalcLimit || 0;
  const remainingDpsCalculations = remainingDpsCalcLimit;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                DPS Calculation Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {userInfo?.name}! Here's your DPS calculation
                overview.
              </p>
            </div>

            {/* Remaining DPS Calculations Display */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {remainingDpsCalculations === -1 ? 'DPS Calculation Limit' : 'Remaining DPS Calculations'}
                  </h3>
                  <p className="text-4xl font-bold text-green-600">
                    {remainingDpsCalculations === -1 ? 'Unlimited' : remainingDpsCalculations}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DpsAccountPage;